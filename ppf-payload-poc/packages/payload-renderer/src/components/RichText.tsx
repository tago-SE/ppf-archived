import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { useRender } from './Context'

export type RichTextProps = {
    data: SerializedEditorState
    enableGutter?: boolean
    enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: RichTextProps) {
    const { RichText } = useRender();
    return <RichText {...props} />
  }
  