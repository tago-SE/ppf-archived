import { ImageShopPluginConfig } from './types'

export const getIframeParams = ({ pluginConfig, apiKey }: { pluginConfig: ImageShopPluginConfig; apiKey?: string }) => {
  if (!apiKey) {
    return null
  }

  const iframeParams: any = {
    IFRAMEINSERT: 'true',
    IMAGESHOPTOKEN: apiKey,
    SHOWSIZEDIALOGUE: pluginConfig.SHOWSIZEDIALOGUE,
    SHOWCROPDIALOGUE: pluginConfig.SHOWCROPDIALOGUE,
    IMAGESHOPINTERFACENAME: pluginConfig.IMAGESHOPINTERFACENAME || '',
    IMAGESHOPSIZES: `${pluginConfig.IMAGE_SIZES || '2048x2048'}`,
    CULTURE: pluginConfig.CULTURE || 'en-US',
    FORMAT: 'json',
    HIDEIMAGEINFO: pluginConfig.HIDEIMAGEINFO,
    INSERTIMIDIATELY: pluginConfig.INSERTIMIDIATELY,
    FREECROP: pluginConfig.FREECROP,
    PROFILEID: pluginConfig.PROFILEID || ''
  }

  return iframeParams
}
