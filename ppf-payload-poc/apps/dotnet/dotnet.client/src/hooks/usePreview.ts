import { ready, isDocumentEvent, isLivePreviewEvent, handleMessage } from '@payloadcms/live-preview';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPreview } from '../utils/preview';
import { PageDataType } from '../types/common';

function getStorageKey(docId: string) {
    return `preview-${docId}`;
}

function getStorageData<T>(docId: string, fallback: T) {
    const item = localStorage.getItem(getStorageKey(docId));
    if (item && item != 'undefined') {
        return JSON.parse(item) as T;
    }

    return fallback;
}

function setStorageData<T>(docId: string | boolean, data: T) {
    if (typeof docId == 'string') {
        localStorage.setItem(getStorageKey(docId), JSON.stringify(data));
    }
}

export function usePreview<T extends PageDataType>(props: {
    depth?: number
    incommingData: T,
    id: string
}) {
    // Checks if should enter preview mode
    const previewKey = getPreview();
    const { depth = 0, incommingData, id } = props;
    const serverURL = import.meta.env.VITE_CMS_URL;

    // Storing data in storage prevents data loss during HMR
    const [data, setData] = useState<T>(previewKey ? getStorageData(previewKey, incommingData) : incommingData)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const hasSentReadyMessage = useRef<boolean>(false)

    const onChange = useCallback((mergedData: T) => {
        setData(mergedData)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        // If preview mode, then register 'message' event listener
        if (!previewKey) {
            return;
        }

        const onMessage = async (event: MessageEvent) => {
            // Handles and content change
            if (isLivePreviewEvent(event, serverURL)) {
                const mergedData = await handleMessage<T>({
                    depth,
                    event,
                    initialData: incommingData,
                    serverURL,
                });

                // Merges with initial data and stores
                onChange(mergedData);
                setStorageData(previewKey, mergedData);
            }

            // Not sure if we need to handle this event...
            if (isDocumentEvent(event, serverURL)) {
                // Reload?
                // window.location.reload();
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('message', onMessage)
        }

        // Once subscribed, send a `ready` message back up to the Admin panel
        // This will indicate that the front-end is ready to receive messages
        if (!hasSentReadyMessage.current) {
            hasSentReadyMessage.current = true

            ready({
                serverURL
            })
        }

        // When the component unmounts, unsubscribe from the `window.postMessage` events
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('message', onMessage);
            }
        }
    }, [serverURL, onChange, depth, incommingData, previewKey]);

    if (!previewKey || previewKey != id) {
        return {
            data: incommingData,
            isLoading: false
        }
    }

    return {
        data: data,
        isLoading,
    }
}