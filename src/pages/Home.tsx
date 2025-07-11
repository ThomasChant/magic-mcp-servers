import React, { useMemo } from "react";
import {
    Search
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useServerStats } from "../hooks/useUnifiedData";
import { useAppStore } from "../store/useAppStore";
import ParticleHero from "../components/ParticleHero";
import Servers from "./Servers";
import { useTopStarServers, type StarServer } from "../hooks/useTopStarServers";
import type { MCPServer } from "../types";


const Home: React.FC = () => {
    const { t } = useTranslation('home');
    
    // Get app store state
    const { searchQuery, setSearchQuery } = useAppStore();
    
    // Get data for hero section
    const { data: serverStats } = useServerStats();
    const { data: topStarServers } = useTopStarServers(200);

    // Use server stats for statistics display with fallbacks
    const statistics = useMemo(() => {
        if (serverStats) {
            return {
                totalServers: serverStats.totalServers,
                averageStars: serverStats.averageStars || 0,
                uniqueCategories: serverStats.uniqueCategories,
                activeRepos: serverStats.activeRepos || 0
            };
        }
        
        return {
            totalServers: 0,
            averageStars: 0,
            uniqueCategories: 0,
            activeRepos: 0
        };
    }, [serverStats]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden cosmic-bg h-[80vh] flex items-center" style={{ isolation: 'isolate' }}>
                <ParticleHero 
                    servers={(topStarServers || []) as (MCPServer | StarServer)[]}
                    searchQuery={searchQuery}
                    maxStars={200}
                />
                
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-30 pointer-events-none" style={{ zIndex: 5 }}></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 pointer-events-none" style={{ zIndex: 10 }}>
                    <div className="text-center animate-fade-in-up">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 relative z-10">
                            {t('hero.title')}
                            <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">{t('hero.titleHighlight')}</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto relative z-10">
                            {t('hero.subtitle')}
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8 relative z-10 pointer-events-auto">
                            <div className="relative rounded-xl p-2" style={{
                                background: 'rgba(100, 255, 218, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(100, 255, 218, 0.3)',
                                boxShadow: '0 8px 32px rgba(100, 255, 218, 0.1)'
                            }}>
                                <input
                                    type="search"
                                    placeholder={t('hero.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-6 py-4 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg border-0 text-lg"
                                    data-testid="home-search-input"
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
                                    <Search className="h-4 w-4 mr-2 inline" />
                                    {t('hero.searchButton')}
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto relative z-10 pointer-events-auto">
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(100, 255, 218, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(100, 255, 218, 0.3)',
                                boxShadow: '0 8px 32px rgba(100, 255, 218, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
                                    {statistics.totalServers > 0 ? statistics.totalServers.toLocaleString() : '...'}
                                </div>
                                <div className="text-gray-300">{t('hero.stats.servers')}</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(147, 51, 234, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(147, 51, 234, 0.3)',
                                boxShadow: '0 8px 32px rgba(147, 51, 234, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent">
                                    {statistics.uniqueCategories > 0 ? statistics.uniqueCategories : '...'}
                                </div>
                                <div className="text-gray-300">{t('hero.stats.categories')}</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-green-300 to-white bg-clip-text text-transparent">
                                    {statistics.averageStars > 0 
                                        ? statistics.averageStars >= 1000
                                            ? `${Math.floor(statistics.averageStars / 1000)}K`
                                            : statistics.averageStars.toLocaleString()
                                        : '...'
                                    }
                                </div>
                                <div className="text-gray-300">{t('hero.stats.averageStars')}</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(249, 115, 22, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                boxShadow: '0 8px 32px rgba(249, 115, 22, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-white bg-clip-text text-transparent">
                                    {statistics.activeRepos > 0 ? statistics.activeRepos.toLocaleString() : '...'}
                                </div>
                                <div className="text-gray-300">{t('hero.stats.activeThisMonth')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Servers Section */}
            <Servers />
        </div>
    );
};

export default Home;