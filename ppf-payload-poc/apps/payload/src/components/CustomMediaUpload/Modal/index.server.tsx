import { PayloadRequest } from 'payload';
import { IMAGESHOP_INSERT_IMAGE_API } from './constants';
import { getIframeParams } from './utils';
import CustomMediaUploadClient from './index.client';

type CustomMediaUploadServerProps = {

} & Pick<PayloadRequest, "payload" | "user" | "i18n">

const CustomMediaUpload: React.FC<CustomMediaUploadServerProps> = (props) => {
    const imageShopConfig = props.payload.collections.media.config.admin.custom;
    const iframeParams = getIframeParams({ pluginConfig: imageShopConfig, apiKey: process.env.IMAGESHOPAPIKEY });
    const imageshopUrl = iframeParams ? `${IMAGESHOP_INSERT_IMAGE_API}?${new URLSearchParams(iframeParams)}` : ''

    return <CustomMediaUploadClient imageshopUrl={imageshopUrl} />
}

export default CustomMediaUpload;