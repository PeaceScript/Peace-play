import { 
    collection, 
    query, 
    where, 
    getDocs, 
    limit, 
    doc, 
    getDoc 
} from 'firebase/firestore';
import { db, legacyDb } from '../config/firebase';
import type { PeacePlayVideo, ListPeacePlayVideosOptions } from '../types/peacePlay';

const COLLECTION_NAME = 'peace-play';
const LEGACY_PROJECT_ID = process.env.NEXT_PUBLIC_LEGACY_FIREBASE_PROJECT_ID || 'peace-script-ai';
const LEGACY_API_KEY = process.env.NEXT_PUBLIC_LEGACY_FIREBASE_API_KEY || 'AIzaSyCMZn8sVtszG_gl1NHjbViAnPy6JVeCHvo';
const SOURCE_TIMEOUT_MS = 2500;
const SOURCE_TIMEOUT_DEEP_MS = 7000;
const PUBLIC_VIDEO_CACHE_TTL_MS = 60_000;
const PUBLIC_VIDEO_CACHE_KEY = 'peace-play-public-videos-cache-v1';

let inMemoryPublicVideosCache: {
    max: number;
    fetchedAt: number;
    videos: PeacePlayVideo[];
} | null = null;

const normalizeNumber = (value: unknown, fallback: number = 0) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
};

const normalizeString = (value: unknown, fallback: string = '') => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
};

const normalizeStringArray = (value: unknown) => {
    if (!Array.isArray(value)) return [] as string[];
    return value.map(item => normalizeString(item)).filter(Boolean);
};

const defaultTimestamp = {
    toMillis: () => 0,
    toDate: () => new Date(0),
    seconds: 0,
};

const normalizeTimestamp = (value: unknown) => {
    if (value && typeof value === 'object') {
        const candidate = value as Record<string, unknown>;
        if (typeof candidate.toMillis === 'function') return value;
        if (typeof candidate.seconds === 'number') {
            const millis = candidate.seconds * 1000;
            return {
                toMillis: () => millis,
                toDate: () => new Date(millis),
                seconds: candidate.seconds,
            };
        }
    }

    if (typeof value === 'string') {
        const millis = Date.parse(value);
        if (!Number.isNaN(millis)) {
            return {
                toMillis: () => millis,
                toDate: () => new Date(millis),
                seconds: Math.floor(millis / 1000),
            };
        }
    }

    return defaultTimestamp;
};

const normalizeVideo = (video: Record<string, unknown>): PeacePlayVideo => {
    const createdAt = normalizeTimestamp(video.createdAt || video.publishedAt || video.updatedAt);
    const updatedAt = normalizeTimestamp(video.updatedAt || video.createdAt || video.publishedAt);

    return {
        videoId: normalizeString(video.videoId),
        userId: normalizeString(video.userId, 'unknown'),
        title: normalizeString(video.title, 'Untitled'),
        description: normalizeString(video.description, ''),
        thumbnailUrl: normalizeString(video.thumbnailUrl, ''),
        videoUrl: normalizeString(video.videoUrl, ''),
        duration: normalizeNumber(video.duration, 0),
        format: (normalizeString(video.format, 'mp4') as any),
        resolution: (normalizeString(video.resolution, '720p') as any),
        fileSize: normalizeNumber(video.fileSize, 0),
        projectId: video.projectId ? normalizeString(video.projectId) : undefined,
        tags: normalizeStringArray(video.tags),
        category: video.category ? normalizeString(video.category) : undefined,
        views: normalizeNumber(video.views, 0),
        likes: normalizeNumber(video.likes, 0),
        shares: normalizeNumber(video.shares, 0),
        privacy: (normalizeString(video.privacy, 'public') as any),
        status: (normalizeString(video.status, 'ready') as any),
        allowComments: Boolean(video.allowComments ?? true),
        allowDownload: Boolean(video.allowDownload ?? false),
        createdAt: createdAt as any,
        updatedAt: updatedAt as any,
        publishedAt: video.publishedAt ? (normalizeTimestamp(video.publishedAt) as any) : undefined,
    };
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, sourceName: string): Promise<T> => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`${sourceName} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
    }
};

const mapVideoSnapshot = (snapshot: Awaited<ReturnType<typeof getDocs>>): PeacePlayVideo[] => {
    return snapshot.docs.map(document => {
        const payload = document.data() as Record<string, unknown>;
        return normalizeVideo({
            ...payload,
            videoId: document.id
        });
    });
};

const toTimestampLike = (value: unknown): unknown => {
    if (typeof value === 'string') {
        const millis = Date.parse(value);
        if (!Number.isNaN(millis)) {
            return {
                toMillis: () => millis,
                toDate: () => new Date(millis),
                seconds: Math.floor(millis / 1000),
            };
        }
    }

    if (Array.isArray(value)) {
        return value.map(toTimestampLike);
    }

    if (value && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, toTimestampLike(nested)]);
        return Object.fromEntries(entries);
    }

    return value;
};

const sortByCreatedAtDesc = (videos: PeacePlayVideo[]) => {
    return videos.sort((a, b) => {
        const timeA = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
    });
};

const getPublicVideosFromDatabase = async (database: typeof db, max: number) => {
    const q = query(
        collection(database, COLLECTION_NAME),
        where('privacy', '==', 'public'),
        limit(max)
    );

    const snapshot = await getDocs(q);
    return mapVideoSnapshot(snapshot);
};

const safeGetPublicVideosFromDatabase = async (database: typeof db, max: number, timeoutMs: number = SOURCE_TIMEOUT_MS) => {
    try {
        return await withTimeout(getPublicVideosFromDatabase(database, max), timeoutMs, 'Firestore SDK query');
    } catch (error) {
        // Source-level failures are expected in fallback mode; keep console clean.
        return [] as PeacePlayVideo[];
    }
};

const parseFirestoreRestValue = (value: any): any => {
    if (!value || typeof value !== 'object') return undefined;
    if ('stringValue' in value) return value.stringValue;
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return Number(value.doubleValue);
    if ('booleanValue' in value) return Boolean(value.booleanValue);
    if ('timestampValue' in value) return value.timestampValue;
    if ('arrayValue' in value) return (value.arrayValue?.values || []).map(parseFirestoreRestValue);
    if ('mapValue' in value) {
        const fields = value.mapValue?.fields || {};
        return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, parseFirestoreRestValue(v)]));
    }
    return undefined;
};

const mapFirestoreRestDocToVideo = (document: any): PeacePlayVideo | null => {
    const name: string = document?.name || '';
    const id = name.split('/').pop();
    const fields = document?.fields || {};
    if (!id) return null;

    const payload = Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, parseFirestoreRestValue(value)])
    ) as Record<string, unknown>;

    const normalizedPayload = toTimestampLike(payload) as Record<string, unknown>;

    return {
        ...normalizeVideo(normalizedPayload),
        videoId: id,
    } as PeacePlayVideo;
};

const fetchPublicVideosViaRest = async (max: number, timeoutMs: number = SOURCE_TIMEOUT_MS): Promise<PeacePlayVideo[]> => {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${LEGACY_PROJECT_ID}/databases/(default)/documents:runQuery?key=${LEGACY_API_KEY}`;
    const body = {
        structuredQuery: {
            from: [{ collectionId: COLLECTION_NAME }],
            where: {
                fieldFilter: {
                    field: { fieldPath: 'privacy' },
                    op: 'EQUAL',
                    value: { stringValue: 'public' },
                },
            },
            limit: max,
        },
    };

    const response = await withTimeout(fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }), timeoutMs, 'Legacy REST query');

    if (!response.ok) {
        throw new Error(`Legacy REST fallback failed: ${response.status}`);
    }

    const rows = (await response.json()) as Array<{ document?: any }>;
    return rows
        .map(row => mapFirestoreRestDocToVideo(row.document))
        .filter((video): video is PeacePlayVideo => Boolean(video));
};

const fetchPublicVideosViaRestList = async (max: number, timeoutMs: number = SOURCE_TIMEOUT_MS): Promise<PeacePlayVideo[]> => {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${LEGACY_PROJECT_ID}/databases/(default)/documents/${COLLECTION_NAME}?pageSize=${Math.max(max * 2, 20)}&key=${LEGACY_API_KEY}`;
    const response = await withTimeout(fetch(endpoint), timeoutMs, 'Legacy REST list query');
    if (!response.ok) {
        throw new Error(`Legacy REST list fallback failed: ${response.status}`);
    }

    const payload = await response.json() as { documents?: any[] };
    const videos = (payload.documents || [])
        .map(document => mapFirestoreRestDocToVideo(document))
        .filter((video): video is PeacePlayVideo => Boolean(video))
        .filter(video => video.privacy === 'public');

    return videos.slice(0, max);
};

const fetchVideoByIdViaRest = async (id: string): Promise<PeacePlayVideo | null> => {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${LEGACY_PROJECT_ID}/databases/(default)/documents/${COLLECTION_NAME}/${id}?key=${LEGACY_API_KEY}`;
    const response = await withTimeout(fetch(endpoint), SOURCE_TIMEOUT_MS, 'Legacy REST document query');
    if (!response.ok) return null;
    const document = await response.json();
    return mapFirestoreRestDocToVideo(document);
};

const readPublicVideosFromStorageCache = (max: number): PeacePlayVideo[] | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(PUBLIC_VIDEO_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as {
            fetchedAt?: number;
            videos?: PeacePlayVideo[];
        };

        if (!parsed?.fetchedAt || !Array.isArray(parsed.videos)) return null;
        if (Date.now() - parsed.fetchedAt > PUBLIC_VIDEO_CACHE_TTL_MS) return null;

        return parsed.videos.slice(0, max);
    } catch {
        return null;
    }
};

const writePublicVideosToStorageCache = (videos: PeacePlayVideo[]) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(
            PUBLIC_VIDEO_CACHE_KEY,
            JSON.stringify({
                fetchedAt: Date.now(),
                videos,
            })
        );
    } catch {
        // ignore cache write issues
    }
};

const getPublicVideosFromFastSources = async (max: number): Promise<PeacePlayVideo[]> => {
    const sources: Array<() => Promise<PeacePlayVideo[]>> = [
        () => fetchPublicVideosViaRestList(max),
        () => fetchPublicVideosViaRest(max),
        () => safeGetPublicVideosFromDatabase(legacyDb, max),
        () => safeGetPublicVideosFromDatabase(db, max),
    ];

    const candidates = sources.map(source =>
        (async () => {
            const videos = await source();
            if (!videos.length) {
                throw new Error('empty-source');
            }
            return videos;
        })()
    );

    try {
        return await withTimeout(Promise.any(candidates), SOURCE_TIMEOUT_MS + 800, 'Parallel video sources');
    } catch {
        return [];
    }
};

const getPublicVideosFromDeepSources = async (max: number): Promise<PeacePlayVideo[]> => {
    const sources: Array<() => Promise<PeacePlayVideo[]>> = [
        () => fetchPublicVideosViaRestList(max, SOURCE_TIMEOUT_DEEP_MS),
        () => fetchPublicVideosViaRest(max, SOURCE_TIMEOUT_DEEP_MS),
        () => safeGetPublicVideosFromDatabase(legacyDb, max, SOURCE_TIMEOUT_DEEP_MS),
        () => safeGetPublicVideosFromDatabase(db, max, SOURCE_TIMEOUT_DEEP_MS),
    ];

    for (const source of sources) {
        const videos = await source();
        if (videos.length > 0) {
            return videos;
        }
    }

    return [];
};

export const getPublicVideos = async (max: number = 20): Promise<PeacePlayVideo[]> => {
    try {
        if (
            inMemoryPublicVideosCache
            && inMemoryPublicVideosCache.max >= max
            && Date.now() - inMemoryPublicVideosCache.fetchedAt <= PUBLIC_VIDEO_CACHE_TTL_MS
        ) {
            return sortByCreatedAtDesc([...inMemoryPublicVideosCache.videos].map(video => normalizeVideo(video as unknown as Record<string, unknown>))).slice(0, max);
        }

        const storageCached = readPublicVideosFromStorageCache(max);
        if (storageCached && storageCached.length > 0) {
            inMemoryPublicVideosCache = {
                max,
                fetchedAt: Date.now(),
                videos: storageCached.map(video => normalizeVideo(video as unknown as Record<string, unknown>)),
            };
            return sortByCreatedAtDesc(storageCached.map(video => normalizeVideo(video as unknown as Record<string, unknown>)));
        }

        let videos = await getPublicVideosFromFastSources(max);

        if (videos.length === 0) {
            videos = await getPublicVideosFromDeepSources(max);
        }

        const sorted = sortByCreatedAtDesc(videos.map(video => normalizeVideo(video as unknown as Record<string, unknown>)));

        if (sorted.length > 0) {
            inMemoryPublicVideosCache = {
                max,
                fetchedAt: Date.now(),
                videos: sorted,
            };
            writePublicVideosToStorageCache(sorted);
        }

        return sorted;
    } catch (error) {
        console.error('Error fetching public videos:', error);
        return [];
    }
};

export const getVideoById = async (id: string): Promise<PeacePlayVideo | null> => {
    try {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return {
                    ...snapshot.data(),
                    videoId: snapshot.id
                } as PeacePlayVideo;
            }
        } catch (error) {
            console.warn('Primary video lookup failed, trying legacy source:', error);
        }

        const legacyDocRef = doc(legacyDb, COLLECTION_NAME, id);
        const legacySnapshot = await getDoc(legacyDocRef);
        if (legacySnapshot.exists()) {
            return {
                ...legacySnapshot.data(),
                videoId: legacySnapshot.id
            } as PeacePlayVideo;
        }

        const legacyRestVideo = await fetchVideoByIdViaRest(id);
        if (legacyRestVideo) {
            return legacyRestVideo;
        }

        return null;
    } catch (error) {
        console.error('Error fetching video:', error);
        return null;
    }
};