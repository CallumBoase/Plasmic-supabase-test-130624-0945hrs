import type { AppProps } from 'next/app';
import { useEffect } from 'react';

//Import the CSS required for SupabaseUppyUploader globally
// import "@uppy/core/dist/style.min.css";
// import "@uppy/dashboard/dist/style.min.css";

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    // Capture the client-side HTML after initial render
    const clientHtml = document.documentElement.outerHTML;

    if (typeof global.serverHtml !== 'undefined') {
      // Compare the HTML strings
      if (global.serverHtml !== clientHtml) {
        console.error('Hydration Error: HTML mismatch detected');
        // console.log('Server HTML:', global.serverHtml);
        // console.log('Client HTML:', clientHtml);
      }
    }
  }, []);



  return <Component {...pageProps} />;
}

export default MyApp;