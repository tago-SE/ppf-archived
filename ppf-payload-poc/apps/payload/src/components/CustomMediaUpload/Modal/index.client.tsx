'use client'

import { useField, Upload, useDocumentInfo, useConfig, useModal, useDrawerSlug, Drawer, Button, LoadingOverlay, Thumbnail } from '@payloadcms/ui';
import { ClientCollectionConfig } from 'payload';
import React, { useEffect, useRef, useState } from 'react';
import { ImageShopAsset, ImageShopIFrameEventData } from './types';
import { IMAGESHOP_CLIENT } from './constants';

type CustomMediaUploadClientProps = {
    imageshopUrl: string
}

type ImageShopProps = {
    imageShopUrl: string | undefined,
}

const ImageshopSelect: React.FC<ImageShopProps> = (props) => {
    const { imageShopUrl } = props;

    const modalUniqueSlug = useDrawerSlug('imageshop')
    const modal = useModal();
    const [isIframeLoading, setIsIframeLoading] = useState(true);
    const { value: externalUrl, setValue: setExternalUrl } = useField<string>({ path: 'externalUrl' });
    const { setValue: setThumbnailURL } = useField<string>({ path: 'externalThumbnailURL' });
    const { setValue: setAlt } = useField<string>({ path: 'alt' });
    const { setValue: setCaption, } = useField<string>({ path: 'caption' });

    const [feValue, setFeValue] = useState<string>(externalUrl); // Value used in frontend, by include version param to forcefully refetch image
    const domId = useRef(Date.now());
    const contentRef = useRef<HTMLDivElement>(null);
    let imageShopIframeUrl = externalUrl !== undefined ? `${imageShopUrl}&IMAGE=${externalUrl}` : imageShopUrl;

    useEffect(() => {
        const handleEvent = (event: MessageEvent) => {
            if (!event || !event.data) {
                return
            }

            if (typeof event.data !== 'string') {
                return
            }

            if (event.origin !== IMAGESHOP_CLIENT) {
                return
            }

            if (!modal.isModalOpen(modalUniqueSlug)) {
                return
            }

            const [imageShopDataString, title] = event.data.split(';') as ImageShopIFrameEventData

            if (!imageShopDataString) {
                return
            }

            const parsedEventData = JSON.parse(imageShopDataString);

            if (Array.isArray(parsedEventData)) {
                if (!event.data) {
                    return
                }
                const imageShopDatas = parsedEventData as ImageShopAsset[]
                if (!imageShopDatas || !Array.isArray(imageShopDatas) || imageShopDatas.length === 0) {
                    return
                }
                //Todo: Handle multifile
            } else {
                const imageShopData = parsedEventData as ImageShopAsset;

                setThumbnailURL(imageShopData.image.thumbnail);

                // TODO: take localized texts from imageshop
                setAlt(imageShopData.text.en.title)
                setCaption({
                    root: {
                        children: [
                            {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: imageShopData.text.en.description,
                                        type: 'text',
                                    },
                                ],
                            },
                        ],
                        type: 'root',
                    },
                });

                setExternalUrl(imageShopData.image.file);
                setFeValue(imageShopData.image.thumbnail);

                modal.closeModal(modalUniqueSlug);
            }
        };

        window.addEventListener('message', handleEvent)

        return () => {
            window.removeEventListener('message', handleEvent)
        }
    }, [modal, setExternalUrl, modalUniqueSlug, setThumbnailURL, setAlt, setCaption])

    return (
        <div className={`flex flex-row border bg-[var(--theme-elevation-50)] rounded-[var(--style-radius-s)] mb-[var(--base)]` + (feValue ? ' border-[var(--theme-elevation-50)] border-solid' : ' border-[var(--theme-elevation-400)] border-dotted')}>
            {feValue && feValue !== '' ? <Thumbnail size='medium' fileSrc={feValue} /> : null}
            <div className="justify-left flex flex-1 items-center text-center gap-x-4 flex-wrap p-[calc(var(--base)*_.9)_var(--base)] [padding-block:calc(var(--base)*2.25)]">
                <Button buttonStyle="pill" size="small" className="m-0" type="button" onClick={() => modal.openModal(modalUniqueSlug)}>
                    {externalUrl !== undefined && externalUrl !== null && externalUrl !== '' ? 'Change Image' : 'Select Image'}
                </Button>
                {externalUrl !== undefined && externalUrl !== null && externalUrl !== '' ? (
                    <Button
                        buttonStyle="pill"
                        size="small"
                        className="group m-0"
                        icon="x"
                        type="button"
                        onClick={() => { setExternalUrl(''); setFeValue(''); }}>
                        Clear
                    </Button>
                ) : null}
                <Drawer slug={modalUniqueSlug}>
                    <div ref={contentRef} id={`imageshopWidget-${domId}`} className="h-[calc(100%-102px-60px)] w-full relative">
                        {isIframeLoading ? <LoadingOverlay /> : null}
                        <iframe className="border-0" width="100%" height="100%" src={imageShopIframeUrl} onLoad={() => { setIsIframeLoading(false) }}></iframe>
                    </div>
                </Drawer>
            </div>
        </div>
    )
}

const CustomMediaUploadClient: React.FC<CustomMediaUploadClientProps> = ({ imageshopUrl }) => {
    const { collectionSlug: docSlug, initialState } = useDocumentInfo();
    const { getEntityConfig } = useConfig();

    const collectionConfig = getEntityConfig({ collectionSlug: docSlug }) as ClientCollectionConfig;
    const { value: mediaSource, initialValue: mediaSourceInitial } = useField<string>({ path: 'mediaSource' });
    const { value: externalUrl } = useField<string>({ path: 'externalUrl' });
    const { setValue: setSelectedFile, initialValue: fileInitialValue } = useField<File>({ path: 'file' })

    useEffect(() => {
        if (mediaSource !== "upload" && mediaSource != mediaSourceInitial) {
            // Create dummy file to keep form submit happy, the file is not uploaded to storage!
            const file = new File([""], "untitled", { type: "text/plain" });
            setSelectedFile(file);
        } else if (mediaSource != mediaSourceInitial) {
            setSelectedFile(fileInitialValue);
        }
    }, [setSelectedFile, mediaSource, mediaSourceInitial, externalUrl, fileInitialValue]);

    return (
        <>
            {mediaSource == "imageshop" ? (
                <ImageshopSelect imageShopUrl={imageshopUrl} />
            ) : mediaSource == "dreambroker" ? (
                <div className='mb-5 d-alert d-alert-warning rounded-sm'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <span>Warning: Dream Broker not implemented!</span>
                </div>
            ) : (
                <Upload
                    collectionSlug={collectionConfig.slug}
                    initialState={initialState}
                    uploadConfig={collectionConfig.upload}
                />
            )}
        </>
    );
};

export default CustomMediaUploadClient;