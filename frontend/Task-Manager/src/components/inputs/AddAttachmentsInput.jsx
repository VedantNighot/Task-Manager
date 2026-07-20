import React, { useState } from 'react'
import { HiMiniPlus, HiOutlineTrash } from 'react-icons/hi2';
import { LuPaperclip } from 'react-icons/lu';

const AddAttachmentsInput = ({ attachments, setAttachments }) => {
    const [option, setOption] = useState("");
    // Function to handle addming an option

    const handleAddOption = () => {
        if (option.trim()) {
            setAttachments([...attachments, option.trim()]);
            setOption("");
        }
    };

    // Function to handle deleteing an option
    const handleDeleteOption = (index) => {
        const updateArr = attachments.filter((_, idx) => idx !== index);
        setAttachments(updateArr);
    }
    const handleView = (item) => {
        if (item.includes('|')) {
            const [name, dataUrl] = item.split('|');
            try {
                const mimeType = dataUrl.split(';')[0].split(':')[1];
                const base64Data = dataUrl.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mimeType });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } catch (e) {
                console.error("View error:", e);
                const newTab = window.open();
                newTab.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            }
        } else {
            let link = item;
            if (!/^https?:\/\//i.test(link)) {
                link = "https://" + link;
            }
            window.open(link, "_blank");
        }
    };

    const handleDownload = (item) => {
        if (item.includes('|')) {
            const [name, dataUrl] = item.split('|');
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            let link = item;
            if (!/^https?:\/\//i.test(link)) {
                link = "https://" + link;
            }
            const downloadLink = document.createElement("a");
            downloadLink.href = link;
            downloadLink.target = "_blank";
            downloadLink.download = "";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div>
            {attachments.map((item, index) => {
                const displayName = item.includes('|') ? item.split('|')[0] : item;
                return (
                    <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2"
                    >
                        <div className="flex-1 flex items-center gap-2 overflow-hidden">
                            <LuPaperclip className="text-gray-400 shrink-0 text-lg" />
                            <p className="text-sm text-black line-clamp-1 break-all">{displayName}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 mx-4">
                            <button 
                                onClick={() => handleView(item)}
                                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                            >
                                View
                            </button>
                            {item.includes('|') && (
                                <>
                                    <span className="text-gray-300 text-xs">|</span>
                                    <button 
                                        onClick={() => handleDownload(item)}
                                        className="text-xs font-semibold text-slate-600 hover:underline cursor-pointer"
                                    >
                                        Download
                                    </button>
                                </>
                            )}
                        </div>

                        <button className="cursor-pointer shrink-0"
                            onClick={() => {
                                handleDeleteOption(index);
                            }}
                        >
                            <HiOutlineTrash className="text-lg text-red-500" />
                        </button>
                    </div>
                );
            })}
            <div className="flex items-center gap-5 mt-4">
                <div className="flex-1 flex items-center gap-3 border border-gray-100 rounded-md px-3">
                    <LuPaperclip className='text-gray-400' />

                    <input
                        type='text'
                        placeholder='Add File Link'
                        value={option}
                        onChange={({ target }) => setOption(target.value)}
                        className='w-full text-[13px] text-black outline-none bg-white py-2'
                    />

                    <button
                        onClick={handleAddOption}
                        className="card-btn text-nowrap">
                        <HiMiniPlus className='text-lg' /> Add
                    </button>
                </div>
            </div>

        </div>
    )
}

export default AddAttachmentsInput
