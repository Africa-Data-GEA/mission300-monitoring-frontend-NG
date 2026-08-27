import { Font } from '@react-pdf/renderer'
import googleSans400 from '@/assets/fonts/google-sans-400.ttf'
import googleSans500 from '@/assets/fonts/google-sans-500.ttf'
import googleSans700 from '@/assets/fonts/google-sans-700.ttf'

/**
 * Registers the app's own self-hosted "Google Sans" (src/styles/fonts.css)
 * with @react-pdf/renderer, so every generated PDF's typography matches the
 * dashboard's rather than falling back to the default PDF-viewer Helvetica.
 * Side-effect import — call sites just need `import './pdf-fonts'`.
 */
Font.register({
  family: 'Google Sans',
  fonts: [
    { src: googleSans400, fontWeight: 400 },
    { src: googleSans500, fontWeight: 500 },
    { src: googleSans700, fontWeight: 700 },
  ],
})
