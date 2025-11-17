export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'gray'
    },
    // Design system overrides from design.json
    button: {
      rounded: 'full', // borderRadius: 9999px from design.json
      padding: {
        md: 'px-6 py-3' // 12px 24px from design.json
      }
    },
    card: {
      rounded: 'xl', // 16px border radius from design.json
      shadow: 'md', // 0 4px 24px rgba(0, 0, 0, 0.05) from design.json
      padding: {
        body: 'p-8' // 32px from design.json
      }
    },
    container: {
      constrain: 'xl' // maxWidth: 1200px from design.json
    }
  }
})
