import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import { SparklesIcon, ClipboardDocumentIcon } from '../../constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// --- TYPE DEFINITIONS ---
interface Experience {
    id: number;
    title: string;
    company: string;
    date: string;
    description: string;
}

interface Education {
    id: number;
    degree: string;
    school: string;
    date: string;
}

interface ResumeData {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    experiences: Experience[];
    educations: Education[];
    skills: string;
}

type TemplateName = 'classic' | 'modern';

// --- RESUME TEMPLATE COMPONENTS ---
const ClassicTemplate: React.FC<ResumeData> = (props) => (
    <div className="p-4 bg-white text-black text-sm font-sans">
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
            <h1 className="text-3xl font-bold">{props.name}</h1>
            <p className="text-xs text-gray-600 mt-1">{props.email} | {props.phone} | {props.linkedin}</p>
        </div>
        <div>
            <h2 className="text-lg font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">Experience</h2>
            {props.experiences.map(exp => (
                <div key={exp.id} className="mb-3">
                    <div className="flex justify-between">
                        <h3 className="font-bold text-md">{exp.title}</h3>
                        <p className="text-xs font-medium">{exp.date}</p>
                    </div>
                    <p className="text-xs italic text-gray-700">{exp.company}</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 mt-1 space-y-1">
                        {exp.description.split('\n').map((line, i) => <li key={i}>{line.replace(/^-/, '').trim()}</li>)}
                    </ul>
                </div>
            ))}
        </div>
        <div className="mt-4">
            <h2 className="text-lg font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">Education</h2>
            {props.educations.map(edu => (
                <div key={edu.id} className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-md">{edu.degree}</h3>
                        <p className="text-xs italic text-gray-700">{edu.school}</p>
                    </div>
                    <p className="text-xs font-medium text-right">{edu.date}</p>
                </div>
            ))}
        </div>
        <div className="mt-4">
            <h2 className="text-lg font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">Skills</h2>
            <p className="text-xs text-gray-600">{props.skills}</p>
        </div>
    </div>
);

const ModernTemplate: React.FC<ResumeData> = (props) => (
    <div className="p-4 bg-white text-black text-sm font-sans flex gap-4">
        {/* Left Column */}
        <div className="w-1/3 pr-4 border-r-2 border-gray-200">
            <h1 className="text-2xl font-bold text-purple-800">{props.name}</h1>
            <div className="mt-4 space-y-2 text-xs">
                <p><strong>Email:</strong> {props.email}</p>
                <p><strong>Phone:</strong> {props.phone}</p>
                <p><strong>LinkedIn:</strong> {props.linkedin}</p>
            </div>
             <div className="mt-6">
                <h2 className="text-md font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">Skills</h2>
                <p className="text-xs text-gray-600">{props.skills}</p>
            </div>
        </div>
        {/* Right Column */}
        <div className="w-2/3">
             <div>
                <h2 className="text-lg font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">Experience</h2>
                {props.experiences.map(exp => (
                    <div key={exp.id} className="mb-3">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-md">{exp.title}</h3>
                            <p className="text-xs font-medium">{exp.date}</p>
                        </div>
                        <p className="text-xs italic text-gray-700">{exp.company}</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 mt-1 space-y-1">
                            {exp.description.split('\n').map((line, i) => <li key={i}>{line.replace(/^-/, '').trim()}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
             <div className="mt-4">
                <h2 className="text-lg font-bold text-purple-700 border-b border-gray-300 pb-1 mb-2">Education</h2>
                {props.educations.map(edu => (
                    <div key={edu.id} className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-md">{edu.degree}</h3>
                            <p className="text-xs italic text-gray-700">{edu.school}</p>
                        </div>
                        <p className="text-xs font-medium text-right">{edu.date}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


export const ResumeBuilder: React.FC = () => {
    const [name, setName] = useState('Alex Johnson');
    const [email, setEmail] = useState('alex.johnson@email.com');
    const [phone, setPhone] = useState('123-456-7890');
    const [linkedin, setLinkedin] = useState('linkedin.com/in/alexjohnson');
    const [experiences, setExperiences] = useState<Experience[]>([
        { id: 1, title: 'Software Engineer Intern', company: 'Tech Solutions Inc.', date: 'May 2023 - Aug 2023', description: '- Developed and maintained web applications using React and Node.js.\n- Collaborated with a team of developers to implement new features.' }
    ]);
    const [educations, setEducations] = useState<Education[]>([
        { id: 1, degree: 'B.S. in Computer Science', school: 'University of Technology', date: 'Expected May 2025' }
    ]);
    const [skills, setSkills] = useState('JavaScript, React, Node.js, Python, SQL, Git');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [template, setTemplate] = useState<TemplateName>('classic');

    const resumeData: ResumeData = { name, email, phone, linkedin, experiences, educations, skills };

    const handleEnhance = async () => {
        setIsEnhancing(true);
        const prompt = `You are an expert resume writing assistant. Your task is to enhance the provided resume data.
- Rewrite descriptions using strong action verbs.
- Ensure a professional and confident tone.
- Correct any spelling or grammar mistakes.
- Keep the content concise and impactful.

The current resume data is:
${JSON.stringify(resumeData, null, 2)}

Please return ONLY a valid JSON object with the exact same structure, containing the enhanced content. Do not include any extra text, explanations, or markdown formatting outside of the JSON object. The 'description' field for experiences should use '\\n' for new lines.`;

        try {
            const response = await generateText(prompt, 'gemini-2.5-pro');
            const jsonString = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
            const enhancedData = JSON.parse(jsonString);

            setName(enhancedData.name || name);
            setEmail(enhancedData.email || email);
            setPhone(enhancedData.phone || phone);
            setLinkedin(enhancedData.linkedin || linkedin);
            setExperiences(enhancedData.experiences || experiences);
            setEducations(enhancedData.educations || educations);
            setSkills(enhancedData.skills || skills);

        } catch (error) {
            console.error("Failed to enhance resume:", error);
            alert("Sorry, there was an error enhancing your resume. Please try again.");
        } finally {
            setIsEnhancing(false);
        }
    };
    
    const handleExportPDF = () => {
        const input = document.getElementById('resume-preview-content');
        if (!input) {
            console.error("Resume content element not found!");
            alert("Could not find the resume to export. Please try again.");
            return;
        }

        setIsExporting(true);
        
        html2canvas(input, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            scrollY: -window.scrollY // Capture from the top of the element
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // A4 paper, portrait, millimeters
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;

            let imgWidth = pdfWidth;
            let imgHeight = imgWidth / ratio;
            
            // If the calculated height is greater than the PDF height, scale by height instead
            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = imgHeight * ratio;
            }

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${name.replace(/\s/g, '_')}_Resume.pdf`);
        }).catch(error => {
            console.error("Could not generate PDF", error);
            alert("Sorry, an error occurred while generating the PDF. Please try again.");
        }).finally(() => {
            setIsExporting(false);
        });
    };


    return (
        <div className="flex flex-col gap-8 h-[calc(100vh-150px)] overflow-y-auto pr-2">
            
            {/* Form Panel */}
            <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 no-print">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Resume Information</h2>
                    <button 
                        onClick={handleEnhance} 
                        disabled={isEnhancing}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2"/>
                        {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                    </button>
                </div>
                 {/* Template Selector */}
                <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-lg flex items-center"><ClipboardDocumentIcon className="w-5 h-5 mr-2" /> Template</h3>
                     <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button onClick={() => setTemplate('classic')} className={`w-full py-2 rounded-md font-semibold transition-colors ${template === 'classic' ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Classic</button>
                        <button onClick={() => setTemplate('modern')} className={`w-full py-2 rounded-md font-semibold transition-colors ${template === 'modern' ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Modern</button>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-lg border-b pb-1 border-gray-200 dark:border-gray-700">Contact</h3>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                    <input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="LinkedIn Profile URL" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                </div>
                <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-lg border-b pb-1 border-gray-200 dark:border-gray-700">Experience</h3>
                     <textarea value={experiences[0].description} onChange={e => setExperiences([{ ...experiences[0], description: e.target.value }])} placeholder="Description" rows={4} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                </div>
                <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-lg border-b pb-1 border-gray-200 dark:border-gray-700">Education</h3>
                    <input type="text" value={educations[0].degree} onChange={e => setEducations([{ ...educations[0], degree: e.target.value }])} placeholder="Degree" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                </div>
                 <div className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-1 border-gray-200 dark:border-gray-700">Skills</h3>
                    <textarea value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills (comma separated)" rows={3} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                </div>
            </div>

            {/* Preview Panel */}
            <div className="w-full p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 no-print">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">Mobile Preview</h2>
                     <button onClick={handleExportPDF} disabled={isExporting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-400">
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
                <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                    <div id="resume-preview" className="h-[600px] overflow-y-auto bg-white rounded-lg">
                         <div id="resume-preview-content">
                            {template === 'classic' && <ClassicTemplate {...resumeData} />}
                            {template === 'modern' && <ModernTemplate {...resumeData} />}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};