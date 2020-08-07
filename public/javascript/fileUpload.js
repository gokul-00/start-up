FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
  )
  
FilePond.setOptions({
    stylePanelAspectRatio: 150 / 100,
    // stylePanelLayout: 'compact circle',
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150
})
  
FilePond.parse(document.body);