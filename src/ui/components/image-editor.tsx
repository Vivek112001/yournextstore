'use client'
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { TABS, TOOLS } from './prop';

const FilerobotImageEditor = dynamic(
    () => import('react-filerobot-image-editor'),
    { ssr: false }
);

export default function ImageEditor({ imgUrl }: { imgUrl: string }) {
    const [isImgEditorShown, setIsImgEditorShown] = useState(false);

    const openImgEditor = () => {
        setIsImgEditorShown(true);
    };

    const closeImgEditor = () => {
        setIsImgEditorShown(false);
    };

    const handleSave = (img: string) => {
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = img;
        link.download = 'Edited Image';

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        closeImgEditor();
    }

    return (
        <div className='w-full flex flex-col justify-center gap-2'>
            <button onClick={openImgEditor}>Open Image editor</button>
            <div className={`fixed inset-0 z-[101] ${isImgEditorShown ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <FilerobotImageEditor
                    source={imgUrl}
                    onSave={(editedImageObject) => handleSave(editedImageObject.imageBase64 ?? imgUrl)}
                    onClose={closeImgEditor}
                    annotationsCommon={{
                        fill: '#000000',
                    }}
                    avoidChangesNotSavedAlertOnLeave={true}
                    Text={{ text: 'Enter your Text here...' }}
                    Rotate={{ angle: 90, componentType: 'slider' }}
                    Crop={{
                        presetsItems: [
                            {
                                titleKey: 'classicTv',
                                descriptionKey: '4:3',
                                ratio: 4 / 3,
                                // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
                            },
                            {
                                titleKey: 'cinemascope',
                                descriptionKey: '21:9',
                                ratio: 21 / 9,
                                // icon: CropCinemaScope, // optional, CropCinemaScope is a React Function component.  Possible (React Function component, string or HTML Element)
                            },
                        ],
                        presetsFolders: [
                            {
                                titleKey: 'socialMedia', // will be translated into Social Media as backend contains this translation key

                                // icon: Social, // optional, Social is a React Function component. Possible (React Function component, string or HTML Element)
                                groups: [
                                    {
                                        titleKey: 'facebook',
                                        items: [
                                            {
                                                titleKey: 'profile',
                                                width: 180,
                                                height: 180,
                                                descriptionKey: 'fbProfileSize',
                                            },
                                            {
                                                titleKey: 'coverPhoto',
                                                width: 820,
                                                height: 312,
                                                descriptionKey: 'fbCoverPhotoSize',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    }}
                    tabsIds={[TABS.ANNOTATE, TABS.ADJUST, TABS.WATERMARK, TABS.FILTERS, TABS.FINETUNE, TABS.RESIZE]} // or {['Adjust', 'Annotate', 'Watermark']}
                    defaultTabId={TABS.ANNOTATE} // or 'Annotate'
                    defaultToolId={TOOLS.TEXT} // or 'Text'
                    savingPixelRatio={4}
                    previewPixelRatio={window.devicePixelRatio}
                    disableSaveIfNoChanges={true} />
            </div>
        </div>
    );
}