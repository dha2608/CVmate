import { useResumeStore } from '@/store/resumeStore';
import { motion } from 'framer-motion';

interface ResumePreviewProps {
  template?: string;
}

const ResumePreview = ({ template = 'modern-red' }: ResumePreviewProps) => {
  const { currentResume } = useResumeStore();
  const { personalInfo, summary, experience, education, skills } = currentResume;

  const getTemplateStyles = () => {
    switch (template) {
      case 'modern-red':
        return {
          headerBorder: 'border-crimson-red',
          accentColor: 'text-crimson-red',
          sectionBorder: 'border-gray-300'
        };
      case 'classic-blue':
        return {
          headerBorder: 'border-blue-600',
          accentColor: 'text-blue-600',
          sectionBorder: 'border-blue-200'
        };
      case 'minimal-black':
        return {
          headerBorder: 'border-gray-900',
          accentColor: 'text-gray-900',
          sectionBorder: 'border-gray-400'
        };
      case 'creative-purple':
        return {
          headerBorder: 'border-purple-500',
          accentColor: 'text-purple-500',
          sectionBorder: 'border-purple-200'
        };
      default:
        return {
          headerBorder: 'border-gray-900',
          accentColor: 'text-gray-900',
          sectionBorder: 'border-gray-300'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <motion.div 
      id="resume-preview" 
      className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-[20mm] text-sm leading-relaxed text-gray-800 mx-auto print:shadow-none print:w-full print:h-auto print:p-0 print:m-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
        {/* Header */}
        <header className={`border-b-2 ${styles.headerBorder} pb-6 mb-6`}>
            <h1 className={`text-4xl font-bold ${styles.accentColor} uppercase tracking-wide mb-2`}>
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
                <h2 className={`text-sm font-bold ${styles.accentColor} uppercase border-b ${styles.sectionBorder} mb-3 pb-1 tracking-wider`}>Professional Summary</h2>
                <p className="text-gray-700 whitespace-pre-line text-justify">{summary}</p>
            </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
            <section className="mb-6">
                <h2 className={`text-sm font-bold ${styles.accentColor} uppercase border-b ${styles.sectionBorder} mb-4 pb-1 tracking-wider`}>Experience</h2>
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
        {education && education.length > 0 && (
            <section className="mb-6">
                <h2 className={`text-sm font-bold ${styles.accentColor} uppercase border-b ${styles.sectionBorder} mb-4 pb-1 tracking-wider`}>Education</h2>
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
        {skills && skills.length > 0 && (
            <section className="mb-6">
                <h2 className={`text-sm font-bold ${styles.accentColor} uppercase border-b ${styles.sectionBorder} mb-3 pb-1 tracking-wider`}>Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                        <span key={i} className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>
        )}
    </motion.div>
  );
};

export default ResumePreview;
