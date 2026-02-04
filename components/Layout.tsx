import React from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="relative min-h-screen pt-32 pb-24 px-6 lg:px-12 max-w-[1500px] mx-auto overflow-hidden">
            {/* Visual Identity Layer */}
            <div className="fixed inset-0 pointer-events-none z-[-2]">
                <div className="absolute top-0 left-0 w-full h-full bg-hxfi-mesh opacity-40" />
                <div className="absolute -top-[10%] left-[20%] w-[60%] h-[60%] bg-hxfi-purple/10 blur-[150px] rounded-full animate-pulse" />
                <div className="scanline" />
            </div>

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {children}
            </motion.main>
        </div>
    );
};

export default Layout;
