
import React, { useState, useCallback, useEffect } from 'react';
import { Page, BlueprintOptions, Blueprint, RoomComponent, Gallery, Theme } from './types';
import * as geminiService from './services/geminiService';
import { Header, LoadingSpinner } from './components/ui';
import { HomePage, BlueprintOptionsPage, BlueprintResultsPage, ArchitecturePage, InteriorDesignPage, GalleryPage } from './components/pages';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    
    // State for the entire design process
    const [options, setOptions] = useState<BlueprintOptions>({
        goal: 'Family-friendly open concept',
        plotWidth: 40,
        plotDepth: 60,
        units: 'Feet',
        floors: 1,
        variations: 1,
    });
    const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
    const [approvedBlueprint, setApprovedBlueprint] = useState<Blueprint | null>(null);
    const [components, setComponents] = useState<RoomComponent[]>([]);
    const [gallery, setGallery] = useState<Gallery>({ blueprint: null, isometricView: undefined, architecture: [], interior: [] });
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const goToHome = () => setCurrentPage(Page.Home);

    const handleGenerateBlueprint = useCallback(async () => {
        setIsLoading('Generating blueprint...');
        try {
            const bpDataUrl = await geminiService.generateBlueprint(options);
            setBlueprints([{ id: `bp-${Date.now()}`, imageDataUrl: bpDataUrl }]);
            setCurrentPage(Page.BlueprintResults);
        } catch (error) {
            console.error(error);
            alert("Failed to generate blueprint. Please try again.");
        } finally {
            setIsLoading(null);
        }
    }, [options]);

    const handleReviseBlueprint = useCallback(async (revision: string) => {
        if (!blueprints.length) return;
        setIsLoading('Revising blueprint...');
        try {
            const revisedBpDataUrl = await geminiService.reviseBlueprint(
                blueprints[0].imageDataUrl,
                revision,
                { plotWidth: options.plotWidth, plotDepth: options.plotDepth, units: options.units }
            );
            setBlueprints([{ id: `bp-${Date.now()}`, imageDataUrl: revisedBpDataUrl }]);
        } catch (error) {
            console.error(error);
            alert("Failed to revise blueprint. Please try again.");
        } finally {
            setIsLoading(null);
        }
    }, [blueprints, options]);

    const handleApproveBlueprint = useCallback(async (blueprint: Blueprint) => {
        setIsLoading("Analyzing blueprint & preparing rooms...");
        try {
            setApprovedBlueprint(blueprint);
            const roomNames = await geminiService.getRoomListFromBlueprintPrompt(options);
            const initialComponents = roomNames.map(name => ({ id: name, name }));
            setComponents(initialComponents);
            setCurrentPage(Page.Architecture);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze blueprint.");
        } finally {
            setIsLoading(null);
        }
    }, [options]);
    
    const handleGenerateArchitecture = useCallback(async (ids: string[]) => {
        setIsLoading("Generating architectural images...");
        try {
            const promises = ids.map(id => {
                const component = components.find(c => c.id === id);
                if (component && !component.architectureImageUrl) { // Only generate if not already generated
                    return geminiService.generateArchitectureImage(component.name, options.floors).then(url => ({id, url}));
                }
                return Promise.resolve(null);
            });
            const results = await Promise.all(promises);
            setComponents(prev => prev.map(c => {
                const result = results.find(r => r?.id === c.id);
                return result ? { ...c, architectureImageUrl: result.url } : c;
            }));
        } catch (error) {
            console.error(error);
            alert("Failed to generate architecture images.");
        } finally {
            setIsLoading(null);
        }
    }, [components, options.floors]);
    
    const handleGenerateInterior = useCallback(async (id: string, style: string) => {
        const component = components.find(c => c.id === id);
        if(!component || !component.architectureImageUrl) return;
        setIsLoading(`Designing the ${component.name}...`);
        try {
            const imageUrl = await geminiService.generateInteriorDesign(component.architectureImageUrl, style, component.name);
            setComponents(prev => prev.map(c => c.id === id ? {...c, interiorImageUrl: imageUrl, interiorStyle: style} : c));
        } catch (error) {
            console.error(error);
            alert(`Failed to design the ${component.name}.`);
        } finally {
            setIsLoading(null);
        }
    }, [components]);

    const handleFinishDesign = () => {
        const allArchitecture = components.filter(c => c.architectureImageUrl);
        const isometricView = allArchitecture.find(c => c.name.toLowerCase().includes('isometric'));
        const otherArchitecture = allArchitecture.filter(c => !c.name.toLowerCase().includes('isometric'));
    
        setGallery({
            blueprint: approvedBlueprint,
            isometricView: isometricView,
            architecture: otherArchitecture,
            interior: components.filter(c => c.interiorImageUrl),
        });
        setCurrentPage(Page.Gallery);
    };

    const renderPage = () => {
        switch (currentPage) {
            case Page.Home:
                return <HomePage setPage={setCurrentPage} />;
            case Page.BlueprintOptions:
                return <BlueprintOptionsPage options={options} setOptions={setOptions} onGenerate={handleGenerateBlueprint} />;
            case Page.BlueprintResults:
                return <BlueprintResultsPage blueprints={blueprints} onApprove={handleApproveBlueprint} onRevise={handleReviseBlueprint} />;
            case Page.Architecture:
                return <ArchitecturePage components={components} onGenerate={handleGenerateArchitecture} onFinish={() => setCurrentPage(Page.InteriorDesign)} />;
            case Page.InteriorDesign:
                return <InteriorDesignPage components={components} onGenerate={handleGenerateInterior} onFinish={handleFinishDesign} />;
            case Page.Gallery:
                return <GalleryPage gallery={gallery} />;
            default:
                return <HomePage setPage={setCurrentPage} />;
        }
    };
    
    const getHeaderTitle = () => {
        switch (currentPage) {
            case Page.Home: return "Welcome";
            case Page.BlueprintOptions: return "Create Blueprint";
            case Page.BlueprintResults: return "Review Your Blueprint";
            case Page.Architecture: return "Create Architectural Views";
            case Page.InteriorDesign: return "Design Your Interiors";
            case Page.Gallery: return "Your Design Gallery";
            default: return "AI Home Design Copilot";
        }
    };

    const showBackButton = currentPage !== Page.Home && currentPage !== Page.Gallery;
    const showHomeButton = currentPage !== Page.Home;
    const showGalleryButton = currentPage !== Page.Home && currentPage !== Page.Gallery;

    // A simple history-like navigation for the back button
    const goBack = () => {
        switch (currentPage) {
            case Page.Gallery:
                setCurrentPage(Page.InteriorDesign);
                break;
            case Page.InteriorDesign:
                setCurrentPage(Page.Architecture);
                break;
            case Page.Architecture:
                 setCurrentPage(Page.BlueprintResults);
                 break;
            case Page.BlueprintResults:
                setCurrentPage(Page.BlueprintOptions);
                break;
            case Page.BlueprintOptions:
                setCurrentPage(Page.Home);
                break;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {isLoading && <LoadingSpinner message={isLoading} />}
            {currentPage !== Page.Home && 
                <Header 
                    title={getHeaderTitle()} 
                    onBack={showBackButton ? goBack : undefined}
                    onHome={showHomeButton ? goToHome : undefined}
                    showGallery={showGalleryButton}
                    onGallery={handleFinishDesign}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                />
            }
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;