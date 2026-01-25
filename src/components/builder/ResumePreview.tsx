import { forwardRef } from 'react';
import { Resume } from '@/store/resumeStore';

interface ResumePreviewProps {
  resume: Resume;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ resume }, ref) => {
  const { personalInfo, summary, experience, education, skills } = resume;

  return (
    <div ref={ref} className="bg-white shadow-xl w-[210mm] min-h-[297mm] p-[20mm] text-sm leading-relaxed text-gray-800 mx-auto print:shadow-none print:w-full print:h-auto print:p-0 print:m-0">
        {/* Header */}
        <header className="border-b-2 border-gray-900 pb-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide mb-2">
                {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            <div className="flex flex-wrap gap-3 text-gray-600 text-xs mt-3">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.address && <span>• {personalInfo.address}</span>}
                {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                {personalInfo.website && <span>• {personalInfo.website}</span>}
            </div>
        </header>

        {/* Summary */}
        {summary && (
            <section className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider">Professional Summary</h2>
                <p className="text-gray-700 whitespace-pre-line text-justify">{summary}</p>
            </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
            <section className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 mb-4 pb-1 tracking-wider">Experience</h2>
                <div className="space-y-4">
                    {experience.map((exp, i) => (
                        <div key={i}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-gray-800 text-base">{exp.position}</h3>
                                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                    {exp.startDate} - {exp.endDate}
                                </span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">{exp.company}</div>
                            <p className="text-gray-600 whitespace-pre-line text-justify text-xs leading-5">
                                {exp.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Education */}
        {education.length > 0 && (
            <section className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 mb-4 pb-1 tracking-wider">Education</h2>
                <div className="space-y-3">
                    {education.map((edu, i) => (
                        <div key={i}>
                             <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-gray-800">{edu.institution}</h3>
                                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                    {edu.startDate} - {edu.endDate}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 italic">{edu.degree}</div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
            <section className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider">Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                        <span key={i} className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>
        )}
    </div>
  );
});

export default ResumePreview;
