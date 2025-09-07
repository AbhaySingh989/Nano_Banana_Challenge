import React, { useState, useEffect } from 'react';
import { Page, BlueprintOptions, Blueprint, RoomComponent, Gallery } from '../types';
import { PRIMARY_GOALS, INTERIOR_STYLES } from '../constants';
import { Card, Button, SelectInput, NumberInput } from './ui';

// Utility function for downloading images
const downloadImage = (imageDataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Fullscreen Image Modal Component
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative w-full h-full flex items-center justify-center">
            <img src={imageUrl} alt="Fullscreen View" className="max-w-full max-h-full object-contain rounded-lg"/>
            <button onClick={onClose} className="absolute top-2 right-2 text-white bg-gray-900 bg-opacity-50 rounded-full p-1 leading-none hover:bg-opacity-75 text-2xl w-10 h-10 flex items-center justify-center">&times;</button>
        </div>
    </div>
);


export const HomePage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const [apiKey, setApiKey] = useState('');

    return (
        <div className="flex flex-col min-h-[80vh] p-8">
            <div className="flex-grow flex flex-col items-center justify-center gap-8 text-center">
                <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-100">Blueprint Nova</h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">Your personal AI architect. Generate and refine blueprints and interior designs with the power of generative AI.</p>
                <div className="flex flex-wrap justify-center gap-6 mt-4">
                    <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-80 cursor-pointer" onClick={() => setPage(Page.BlueprintOptions)}>
                        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200">Build Home From Scratch</h2>
                        <p className="text-slate-600 dark:text-slate-400">Generate a brand new architectural blueprint based on your specifications.</p>
                    </Card>
                    <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-80 cursor-pointer" onClick={() => alert('Feature coming soon!')}>
                        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200">Redesign Existing House</h2>
                        <p className="text-slate-600 dark:text-slate-400">Upload your current floor plan to start redesigning your interior spaces.</p>
                    </Card>
                </div>
            </div>
            <div className="flex-shrink-0 flex justify-center mt-8">
                <div className="w-full max-w-md text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        Enter your ElevenLabs API key below for a lifelike narration experience.
                    </p>
                    <input
                        type="text"
                        placeholder="Enter your ElevenLabs API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                </div>
            </div>
        </div>
    );
};

export const BlueprintOptionsPage: React.FC<{ options: BlueprintOptions, setOptions: (o: BlueprintOptions) => void, onGenerate: () => void }> = ({ options, setOptions, onGenerate }) => (
  <div className="flex items-center justify-center py-8">
    <Card className="space-y-6 w-full max-w-2xl">
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-200">Define Your New Home</h2>
      <SelectInput label="Primary Goal" options={PRIMARY_GOALS} value={options.goal} onChange={e => setOptions({...options, goal: e.target.value})} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberInput label="Plot Width" value={options.plotWidth} onChange={e => setOptions({...options, plotWidth: parseInt(e.target.value)})} units={options.units} />
        <NumberInput label="Plot Depth" value={options.plotDepth} onChange={e => setOptions({...options, plotDepth: parseInt(e.target.value)})} units={options.units} />
        <SelectInput label="Units" options={['Feet', 'Meters']} value={options.units} onChange={e => setOptions({...options, units: e.target.value as 'Feet' | 'Meters'})} />
      </div>
      <NumberInput label="Number of Floors" value={options.floors} onChange={e => setOptions({...options, floors: parseInt(e.target.value)})} />
      <Button onClick={onGenerate} className="w-full" size="lg">Generate Blueprint</Button>
    </Card>
  </div>
);

export const BlueprintResultsPage: React.FC<{ blueprints: Blueprint[], onApprove: (bp: Blueprint) => void, onRevise: (rev: string) => void }> = ({ blueprints, onApprove, onRevise }) => {
    const [revisionText, setRevisionText] = useState('');
    const [modalImage, setModalImage] = useState<string | null>(null);
    
    return (
    <div className="flex flex-col items-center gap-6">
        {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
        {blueprints.map(bp => (
        <div key={bp.id} className="w-full max-w-4xl flex flex-col gap-6">
            <Card className="flex flex-col items-center gap-4">
                 <img src={bp.imageDataUrl} alt="Generated Blueprint" className="w-full object-contain rounded-lg cursor-pointer bg-white" onClick={() => setModalImage(bp.imageDataUrl)} />
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={() => setModalImage(bp.imageDataUrl)} variant="secondary">View Full Screen</Button>
                    <Button onClick={() => downloadImage(bp.imageDataUrl, `blueprint-${bp.id}.png`)} variant="secondary">Download</Button>
                </div>
            </Card>
            <Button onClick={() => onApprove(bp)} size="lg" className="w-full">Approve this Blueprint & Continue</Button>
        </div>
        ))}
        <Card className="w-full max-w-4xl">
            <h3 className="text-xl font-bold mb-2 dark:text-slate-200">Need a Change?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Describe any changes you'd like to make, and the AI will revise the blueprint.</p>
            <textarea value={revisionText} onChange={e => setRevisionText(e.target.value)} className="w-full p-2 border rounded-lg mb-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 dark:text-white" placeholder="e.g., 'Make the kitchen bigger' or 'Add a balcony to the master bedroom'"></textarea>
            <Button onClick={() => { onRevise(revisionText); setRevisionText(''); }}>Submit Revision</Button>
        </Card>
    </div>
    );
};

export const ArchitecturePage: React.FC<{ components: RoomComponent[], onGenerate: (ids: string[]) => void, onFinish: () => void }> = ({ components, onGenerate, onFinish }) => {
    const [selected, setSelected] = useState<string[]>(['Living Room', 'Isometric View of House']);
    const [modalImage, setModalImage] = useState<string | null>(null);

    const toggleSelection = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    return (
        <div className="w-full">
            {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
            <Card>
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-1 dark:text-slate-200">Generate Architectural Views</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Select components to generate empty architectural views. The Isometric view will show the house exterior.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {components.map(c => (
                        <div key={c.id}>
                            {c.architectureImageUrl ? (
                                <div className="p-2 flex flex-col gap-2 h-full border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                                    <p className="font-semibold text-center h-8 flex items-center justify-center truncate dark:text-slate-200">{c.name}</p>
                                    <img src={c.architectureImageUrl} alt={c.name} className="object-cover rounded cursor-pointer w-full aspect-square" onClick={() => setModalImage(c.architectureImageUrl!)} />
                                    <div className="grid grid-cols-2 gap-1 mt-2">
                                        <Button onClick={() => setModalImage(c.architectureImageUrl!)} variant="secondary" size="sm">View</Button>
                                        <Button onClick={() => downloadImage(c.architectureImageUrl!, `arch-${c.id}.png`)} variant="secondary" size="sm">Download</Button>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => toggleSelection(c.id)} className={`p-4 border-2 rounded-lg cursor-pointer text-center flex items-center justify-center transition-all min-h-[200px] aspect-square ${selected.includes(c.id) ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                                    <span className="font-semibold dark:text-slate-300">{c.name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button onClick={() => onGenerate(selected)} size="lg" className="flex-grow">Generate Selected</Button>
                    <Button onClick={onFinish} variant="secondary" size="lg" className="flex-grow" disabled={components.every(c => !c.architectureImageUrl)}>Next: Interior Design</Button>
                </div>
            </Card>
        </div>
    );
};

export const InteriorDesignPage: React.FC<{ components: RoomComponent[], onGenerate: (id: string, style: string) => void, onFinish: () => void }> = ({ components, onGenerate, onFinish }) => {
    const [selectedComp, setSelectedComp] = useState<RoomComponent | null>(components.find(c => c.architectureImageUrl && !c.name.toLowerCase().includes('isometric')) || null);
    const [style, setStyle] = useState<string>(INTERIOR_STYLES[0]);
    const [modalImage, setModalImage] = useState<string | null>(null);
    
    useEffect(() => {
        if (selectedComp) {
            const updatedSelectedComp = components.find(c => c.id === selectedComp.id);
            if (updatedSelectedComp && updatedSelectedComp.interiorImageUrl !== selectedComp.interiorImageUrl) {
                setSelectedComp(updatedSelectedComp);
            }
        }
    }, [components, selectedComp]);

    const archComps = components.filter(c => c.architectureImageUrl && !c.name.toLowerCase().includes("isometric"));

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
            <Card className="lg:w-96 flex-shrink-0">
                <h2 className="text-xl font-bold mb-4 dark:text-slate-200">Select a Room</h2>
                <div className="space-y-2">
                {archComps.length > 0 ? archComps.map(c => (
                    <div key={c.id} onClick={() => setSelectedComp(c)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedComp?.id === c.id ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600'}`}>{c.name}</div>
                )) : <p className="text-slate-500 dark:text-slate-400">No rooms with architectural views have been generated yet.</p>}
                </div>
                 <Button onClick={onFinish} variant="primary" size="lg" className="w-full mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">Finish Design</Button>
            </Card>
            <div className="flex-grow">
                {selectedComp ? (
                    <Card className="flex flex-col h-full">
                        <h2 className="text-3xl font-bold mb-4 text-center dark:text-slate-200">Design: {selectedComp.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="font-semibold text-center mb-2 dark:text-slate-300">Before (Architecture)</h3>
                                <img src={selectedComp.architectureImageUrl} alt="Empty room" className="rounded-lg cursor-pointer w-full object-cover" onClick={() => setModalImage(selectedComp.architectureImageUrl!)} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-center mb-2 dark:text-slate-300">After (Interior Design)</h3>
                                {selectedComp.interiorImageUrl ? (
                                    <div className="flex flex-col gap-2">
                                        <img src={selectedComp.interiorImageUrl} alt="Designed room" className="rounded-lg cursor-pointer w-full object-cover" onClick={() => setModalImage(selectedComp.interiorImageUrl!)} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button onClick={() => setModalImage(selectedComp.interiorImageUrl!)} variant="secondary" size="sm">View</Button>
                                            <Button onClick={() => downloadImage(selectedComp.interiorImageUrl!, `interior-${selectedComp.id}.png`)} variant="secondary" size="sm">Download</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full w-full bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 aspect-square">Awaiting design...</div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-end gap-4 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                            <SelectInput label="Interior Style" options={INTERIOR_STYLES} value={style} onChange={e => setStyle(e.target.value)} />
                            <Button onClick={() => onGenerate(selectedComp.id, style)} size="lg">Generate</Button>
                        </div>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-full">
                        <p className="text-slate-500 dark:text-slate-400 text-xl">Select a room from the left to begin designing.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export const GalleryPage: React.FC<{ gallery: Gallery }> = ({ gallery }) => {
    const [modalImage, setModalImage] = useState<string | null>(null);

    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
        
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center dark:text-slate-200">Architecture</h2>
             <Card className="flex flex-col gap-2 items-center p-4">
                <h3 className="font-bold text-lg dark:text-slate-300">Blueprint</h3>
                {gallery.blueprint ? <img src={gallery.blueprint.imageDataUrl} onClick={() => setModalImage(gallery.blueprint!.imageDataUrl)} alt="Final Blueprint" className="w-full rounded-lg shadow-md cursor-pointer bg-white" /> : <p className="dark:text-slate-400">No blueprint.</p>}
                 <h3 className="font-bold text-lg mt-4 dark:text-slate-300">Isometric View</h3>
                {gallery.isometricView?.architectureImageUrl ? (
                    <img src={gallery.isometricView.architectureImageUrl} onClick={() => setModalImage(gallery.isometricView!.architectureImageUrl!)} alt={gallery.isometricView.name} className="w-full rounded-lg shadow-md cursor-pointer"/>
                ) : <p className="dark:text-slate-400">No isometric view.</p>}
            </Card>
        </div>
        
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center dark:text-slate-200">Empty Rooms</h2>
            <div className="space-y-4">
            {gallery.architecture.length > 0 ? gallery.architecture.map(c => c.architectureImageUrl && (
                <Card key={c.id} className="p-2">
                    <h3 className="font-bold text-center mb-2 dark:text-slate-300">{c.name}</h3>
                    <img src={c.architectureImageUrl} onClick={() => setModalImage(c.architectureImageUrl!)} alt={c.name} className="rounded-lg w-full cursor-pointer"/>
                </Card>
            )) : <Card className="flex items-center justify-center"><p className="dark:text-slate-400">No rooms generated.</p></Card>}
            </div>
        </div>

        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center dark:text-slate-200">Designed Interiors</h2>
            <div className="space-y-4">
            {gallery.interior.length > 0 ? gallery.interior.map(c => c.interiorImageUrl && (
                <Card key={c.id} className="p-2">
                    <h3 className="font-bold text-center mb-2 dark:text-slate-300">{c.name} - {c.interiorStyle}</h3>
                    <img src={c.interiorImageUrl} onClick={() => setModalImage(c.interiorImageUrl!)} alt={c.name} className="rounded-lg w-full cursor-pointer"/>
                </Card>
            )) : <Card className="flex items-center justify-center"><p className="dark:text-slate-400">No interiors designed.</p></Card>}
            </div>
        </div>
    </div>
    );
};