import { useResumeStore } from '@/store/resumeStore';
import { motion } from 'framer-motion';

interface ResumePreviewProps {
  template?: string;
  sections?: { id: string; label: string; visible: boolean }[];
}

const ResumePreview = ({ template = 'modern-red', sections }: ResumePreviewProps) => {
  const currentResume = useResumeStore((s) => s.currentResume);
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
      case 'ats-minimal':
        return {
          headerBorder: 'border-gray-400',
          accentColor: 'text-gray-800',
          sectionBorder: 'border-gray-200'
        };
      case 'sidebar-accent':
        return {
          headerBorder: 'border-gray-900',
          accentColor: 'text-gray-900',
          sectionBorder: 'border-gray-300'
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

  const renderHeader = () => (
    <header className={`border-b-2 ${styles.headerBorder} pb-6 mb-6`}>
      <h1 className={`text-4xl font-bold ${styles.accentColor} uppercase tracking-wide mb-3`}>
        {personalInfo.fullName || 'YOUR NAME'}
      </h1>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600 dark:text-gray-400 text-xs mt-3">
        {personalInfo.email && <span className="flex items-center gap-1">{personalInfo.email}</span>}
        {personalInfo.phone && <span className="flex items-center gap-1">• {personalInfo.phone}</span>}
        {personalInfo.address && <span className="flex items-center gap-1">• {personalInfo.address}</span>}
        {personalInfo.linkedin && <span className="flex items-center gap-1">• {personalInfo.linkedin}</span>}
        {personalInfo.website && <span className="flex items-center gap-1">• {personalInfo.website}</span>}
      </div>
    </header>
  );

  const renderSection = (id: string) => {
    switch (id) {
      case 'personal':
        return renderHeader();
      case 'summary':
        return summary ? (
          <section className="mb-6" key="summary">
            <h2 className={`text-sm font-bold ${styles.accentColor} uppercase border-b ${styles.sectionBorder} mb-3 pb-1.5 tracking-wider`}>
              Professional Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-justify leading-relaxed">{summary}</p>
          </section>
        ) : null;
      case 'experience':
        return experience && experience.length > 0 ? (
          <section className="mb-6" key="experience">
            <h2 className={`text-sm font-bold ${styles.accentColor} uppercase border-b ${styles.sectionBorder} mb-4 pb-1.5 tracking-wider`}>Experience</h2>
            <div className="space-y-5">
              {experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-crimson-red dark:bg-red-500" />
                  <div className="flex flex-wrap justify-between items-baseline mb-1 gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{exp.position || 'Position'}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                      {exp.startDate || 'Start'} {exp.endDate ? `- ${exp.endDate}` : ''}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{exp.company || 'Company'}</div>
                  {exp.description && (
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line text-justify text-xs leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null;
      case 'education':
        return education && education.length > 0 ? (
          <section className="mb-6" key="education">
            <h2 className={`text-sm font-bold ${styles.accentColor} uppercase border-b ${styles.sectionBorder} mb-4 pb-1.5 tracking-wider`}>Education</h2>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400" />
                  <div className="flex flex-wrap justify-between items-baseline mb-1 gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{edu.institution || 'Institution'}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                      {edu.startDate || 'Start'} {edu.endDate ? `- ${edu.endDate}` : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">{edu.degree || 'Degree'}</div>
                  {edu.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed mt-1">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null;
      case 'skills':
        return skills && skills.length > 0 ? (
          <section className="mb-6" key="skills">
            <h2 className={`text-sm font-bold ${styles.accentColor} uppercase border-b ${styles.sectionBorder} mb-3 pb-1.5 tracking-wider`}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ) : null;
      default:
        return null;
    }
  };

  const orderedSections = (sections && sections.length > 0)
    ? sections.filter((s) => s.visible !== false).map((s) => s.id)
    : ['personal', 'summary', 'experience', 'education', 'skills'];

  // Sidebar layout template
  if (template === 'sidebar-accent') {
    return (
      <motion.div
        id="resume-preview"
        className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-0 text-sm leading-relaxed text-gray-800 mx-auto print:shadow-none print:w-full print:h-auto print:p-0 print:m-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <aside className="w-2/5 bg-gray-900 text-white p-8 flex flex-col">
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-4">
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            <div className="space-y-2 text-xs">
              {personalInfo.email && <p>{personalInfo.email}</p>}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.address && <p>{personalInfo.address}</p>}
              {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
              {personalInfo.website && <p>{personalInfo.website}</p>}
            </div>

            {skills && skills.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-3">
                  Skills
                </h2>
                <ul className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <li
                      key={i}
                      className="text-[11px] bg-gray-800 px-2 py-1 rounded-full"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="w-3/5 p-8">
            {summary && (
              <section className="mb-6">
                <h2 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider">
                  Professional Summary
                </h2>
                <p className="text-gray-700 whitespace-pre-line text-justify text-[13px]">
                  {summary}
                </p>
              </section>
            )}

            {experience && experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider">
                  Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{exp.position}</h3>
                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                          {exp.startDate} - {exp.endDate}
                        </span>
                      </div>
                      <div className="text-[13px] font-medium text-gray-700 mb-1">
                        {exp.company}
                      </div>
                      <p className="text-gray-600 whitespace-pre-line text-justify text-[12px] leading-5">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {education && education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 mb-3 pb-1 tracking-wider">
                  Education
                </h2>
                <div className="space-y-3">
                  {education.map((edu, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {edu.institution}
                        </h3>
                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                      <div className="text-[13px] text-gray-600 italic">{edu.degree}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </motion.div>
    );
  }

  // Default single-column layout
  return (
    <motion.div 
      id="resume-preview" 
      className="bg-white dark:bg-gray-900 shadow-xl w-full max-w-[210mm] min-h-[297mm] p-[20mm] text-sm leading-relaxed text-gray-800 dark:text-gray-200 mx-auto print:shadow-none print:w-full print:h-auto print:p-0 print:m-0 print:bg-white print:text-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
        {orderedSections.map((id) => (
          <div key={id}>{renderSection(id)}</div>
        ))}
    </motion.div>
  );
};

export default ResumePreview;
