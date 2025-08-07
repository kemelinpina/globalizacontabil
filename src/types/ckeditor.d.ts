declare global {
  interface Window {
    CKEDITOR: {
      disableAutoInline: boolean
      [key: string]: any
    }
  }
}

export interface CKEditorEvent {
  editor: {
    getData: () => string
    setData: (data: string) => void
    [key: string]: any
  }
} 