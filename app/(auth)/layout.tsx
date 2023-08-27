import { ClerkProvider } from '@clerk/nextjs';
import {ReactNode} from 'react';
import {Inter} from 'next/font/google'
import {dark} from '@clerk/themes';
import "../globals.css"
export const metadata = {
    title: 'Auth',
    description: "NextJS 13 Meta Threads Clone"

    
}

const inter = Inter({subsets: ['latin']})
const RootLayout = ({children}:{children: ReactNode})=>{
    return (
        <ClerkProvider appearance={{
            baseTheme: dark
        }}>
        <html lang='en'>
            <body className={`${inter.className} bg-dark-1`}>
                {children}
            </body>
        </html>
        </ClerkProvider>
    )
}

export default RootLayout;