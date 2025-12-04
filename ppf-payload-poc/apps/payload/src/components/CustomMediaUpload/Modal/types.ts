export type ImageShopAsset = {
  documentId: string
  code: string
  extraInfo: null | string
  AuthorName: null | string
  image: {
    file: string
    width: number
    height: number
    thumbnail: string
  }
  text: {
    [k: string]: {
      title: string
      description: string
      rights: string
      credits: string
      tags: string
      categories: string[]
    }
  }
  InterfaceList: Array<{
    InterfaceID: number
    InterfaceName: string
  }>
  profile: any
}

export type ImageShopIFrameEventData = [string, string, number, number]

export interface ImageShopPluginConfig {
  SHOWSIZEDIALOGUE?: boolean
  SHOWCROPDIALOGUE?: boolean
  IMAGESHOPINTERFACENAME?: string
  IMAGE_SIZES?: string
  CULTURE?: string
  HIDEIMAGEINFO?: boolean
  INSERTIMIDIATELY?: boolean
  FREECROP?: boolean
  PROFILEID?: string
}
