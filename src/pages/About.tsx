import React, { useEffect, useRef } from "react";
import {
    Search,
    Shield,
    Users,
    Heart,
    Leaf,
    Scale,
    Rocket,
    Mail,
    Github,
    Twitter,
    MessageCircle,
} from "lucide-react";

const About: React.FC = () => {
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Animate stats on scroll
        const statsSection = statsRef.current;
        const statsNumbers = document.querySelectorAll(".stats-number");

        const observerOptions = {
            threshold: 0.5,
            rootMargin: "0px 0px -100px 0px",
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    statsNumbers.forEach((number, index) => {
                        setTimeout(() => {
                            const element = number as HTMLElement;
                            element.style.transform = "scale(1.1)";
                            setTimeout(() => {
                                element.style.transform = "scale(1)";
                            }, 200);
                        }, index * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        if (statsSection) {
            observer.observe(statsSection);
        }

        // Add smooth transitions to stats
        statsNumbers.forEach((number) => {
            const element = number as HTMLElement;
            element.style.transition = "transform 0.3s ease";
        });

        return () => {
            if (statsSection) {
                observer.unobserve(statsSection);
            }
        };
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700">
                <div className="absolute inset-0 bg-black opacity-20 dark:opacity-30"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            About MCP Hub
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 dark:text-blue-200 mb-8 max-w-3xl mx-auto">
                            Empowering developers to build better AI applications
                            through accessible, reliable, and well-documented MCP
                            servers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Mission
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            To democratize access to Model Context Protocol servers
                            and accelerate AI innovation worldwide.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 hover:transform hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="text-white w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Discoverability
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Make it easy for developers to find the perfect MCP
                                server for their specific needs through intelligent
                                search and categorization.
                            </p>
                        </div>

                        <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-xl p-8 hover:transform hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="text-white w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Quality Assurance
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Ensure reliability and security through
                                community-driven ratings, reviews, and comprehensive
                                testing of all listed servers.
                            </p>
                        </div>

                        <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-xl p-8 hover:transform hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="text-white w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Community
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Foster a vibrant ecosystem where developers can
                                share knowledge, contribute servers, and collaborate
                                on AI innovations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Our Story
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                How MCP Hub came to be and why we're passionate
                                about the future of AI development.
                            </p>
                        </div>

                        <div className="prose prose-lg max-w-none">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    The Challenge
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    When Model Context Protocol was introduced, we
                                    immediately recognized its potential to
                                    revolutionize how AI applications connect with
                                    external data and tools. However, we also
                                    noticed a significant challenge: while the
                                    protocol was powerful, discovering and
                                    integrating MCP servers was fragmented and
                                    difficult.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Developers were spending countless hours
                                    searching through GitHub repositories,
                                    documentation scattered across different
                                    platforms, and struggling to evaluate the
                                    quality and reliability of available servers.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    The Solution
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    MCP Hub was born from this need. We envisioned a
                                    centralized platform where developers could
                                    easily discover, evaluate, and integrate MCP
                                    servers with confidence. Our goal was to create
                                    not just a directory, but a comprehensive
                                    ecosystem that would accelerate AI development.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We built intelligent search capabilities,
                                    community-driven quality assurance,
                                    comprehensive documentation, and tools that make
                                    integration as simple as a few clicks.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    The Future
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Today, MCP Hub serves thousands of developers
                                    worldwide, hosting hundreds of high-quality MCP
                                    servers across dozens of categories. But we're
                                    just getting started.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Our roadmap includes AI-powered recommendations,
                                    automated testing and monitoring, enhanced
                                    collaboration tools, and continued expansion of
                                    our server ecosystem. We're committed to
                                    remaining at the forefront of the MCP
                                    revolution.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            The principles that guide everything we do at MCP Hub.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Heart className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Open Source First
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                We believe in the power of open source and
                                contribute back to the community that makes our work
                                possible.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Leaf className="text-green-600 dark:text-green-400 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Sustainability
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Building for the long term with sustainable
                                practices and responsible resource usage.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Scale className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Transparency
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Clear communication, open processes, and honest
                                feedback in all our interactions.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Rocket className="text-orange-600 dark:text-orange-400 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Innovation
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Continuously pushing boundaries and exploring new
                                ways to improve the developer experience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Meet Our Team
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            The passionate individuals behind MCP Hub, working to
                            make AI development more accessible.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Team Member 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:transform hover:-translate-y-2 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl font-bold">AS</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Alex Smith
                            </h3>
                            <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                                Founder & CEO
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                Former AI researcher with 10+ years in machine
                                learning and distributed systems. Passionate about
                                making AI accessible to everyone.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Team Member 2 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:transform hover:-translate-y-2 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl font-bold">SC</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Sarah Chen
                            </h3>
                            <p className="text-green-600 dark:text-green-400 font-medium mb-3">
                                CTO & Co-founder
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                Full-stack engineer and open source advocate. Leads
                                our technical architecture and platform development
                                efforts.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Team Member 3 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:transform hover:-translate-y-2 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl font-bold">MJ</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Marcus Johnson
                            </h3>
                            <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">
                                Head of Community
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                Developer relations expert focused on building and
                                nurturing our growing community of MCP server
                                developers and users.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            By the Numbers
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Our impact on the MCP ecosystem and developer community.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8" ref={statsRef}>
                        <div className="text-center">
                            <div className="stats-number text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                200+
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">MCP Servers</div>
                        </div>
                        <div className="text-center">
                            <div className="stats-number text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                                50K+
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">Monthly Downloads</div>
                        </div>
                        <div className="text-center">
                            <div className="stats-number text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                                10K+
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">Active Developers</div>
                        </div>
                        <div className="text-center">
                            <div className="stats-number text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                                25
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">Countries</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Get in Touch
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Have questions, suggestions, or want to contribute? We'd
                            love to hear from you.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Mail className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Email Us
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">hello@mcphub.dev</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Join Discord
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">Community chat</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Github className="text-gray-600 dark:text-gray-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Contribute
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">Open source</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:hello@mcphub.dev"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                            >
                                <Mail className="mr-2 w-5 h-5" />
                                Send us an Email
                            </a>
                            <a
                                href="https://github.com/mcphub"
                                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Github className="mr-2 w-5 h-5" />
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;