import { memo } from 'react';
import { motion } from 'framer-motion';
import { useResumeStore } from '@/store/resumeStore';

interface ResumePreviewProps {
  template?: string;
  sections?: { id: string; label: string; visible: boolean }[];
}

interface TemplateConfig {
  headerStyle: 'banner' | 'line' | 'sidebar';
  primary: string;
  primaryText: string;
  accent: string;
  sectionBg: string;
  sectionText: string;
  border: string;
  skillPill: string;
  bullet: string;
}

const TEMPLATES: Record<string, TemplateConfig> = {
  'modern-red': {
    headerStyle: 'banner',
    primary: 'bg-red-600',
    primaryText: 'text-white',
    accent: 'text-red-600',
    sectionBg: 'bg-red-600',
    sectionText: 'text-white',
    border: 'border-red-200',
    skillPill: 'bg-red-50 text-red-700 border border-red-200',
    bullet: 'bg-red-500',
  },
  'classic-blue': {
    headerStyle: 'banner',
    primary: 'bg-blue-800',
    primaryText: 'text-white',
    accent: 'text-blue-800',
    sectionBg: 'bg-blue-800',
    sectionText: 'text-white',
    border: 'border-blue-200',
    skillPill: 'bg-blue-50 text-blue-800 border border-blue-200',
    bullet: 'bg-blue-600',
  },
  'minimal-black': {
    headerStyle: 'line',
    primary: 'bg-gray-900',
    primaryText: 'text-white',
    accent: 'text-gray-900',
    sectionBg: 'bg-transparent',
    sectionText: 'text-gray-900',
    border: 'border-gray-900',
    skillPill: 'bg-gray-100 text-gray-800 border border-gray-300',
    bullet: 'bg-gray-900',
  },
  'creative-purple': {
    headerStyle: 'banner',
    primary: 'bg-purple-700',
    primaryText: 'text-white',
    accent: 'text-purple-700',
    sectionBg: 'bg-purple-700',
    sectionText: 'text-white',
    border: 'border-purple-200',
    skillPill: 'bg-purple-50 text-purple-700 border border-purple-200',
    bullet: 'bg-purple-500',
  },
  'ats-minimal': {
    headerStyle: 'line',
    primary: 'bg-gray-50',
    primaryText: 'text-gray-900',
    accent: 'text-gray-800',
    sectionBg: 'bg-transparent',
    sectionText: 'text-gray-800',
    border: 'border-gray-400',
    skillPill: 'bg-white text-gray-700 border border-gray-300',
    bullet: 'bg-gray-500',
  },
  'sidebar-accent': {
    headerStyle: 'sidebar',
    primary: 'bg-gray-900',
    primaryText: 'text-white',
    accent: 'text-gray-900',
    sectionBg: 'bg-transparent',
    sectionText: 'text-gray-900',
    border: 'border-gray-300',
    skillPill: 'bg-gray-700 text-gray-100',
    bullet: 'bg-gray-600',
  },
  'elegant-green': {
    headerStyle: 'banner',
    primary: 'bg-emerald-700',
    primaryText: 'text-white',
    accent: 'text-emerald-700',
    sectionBg: 'bg-emerald-700',
    sectionText: 'text-white',
    border: 'border-emerald-200',
    skillPill: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    bullet: 'bg-emerald-500',
  },
  'bold-orange': {
    headerStyle: 'banner',
    primary: 'bg-orange-500',
    primaryText: 'text-white',
    accent: 'text-orange-500',
    sectionBg: 'bg-orange-500',
    sectionText: 'text-white',
    border: 'border-orange-200',
    skillPill: 'bg-orange-50 text-orange-700 border border-orange-200',
    bullet: 'bg-orange-400',
  },
  'professional-teal': {
    headerStyle: 'banner',
    primary: 'bg-teal-700',
    primaryText: 'text-white',
    accent: 'text-teal-700',
    sectionBg: 'bg-teal-700',
    sectionText: 'text-white',
    border: 'border-teal-200',
    skillPill: 'bg-teal-50 text-teal-800 border border-teal-200',
    bullet: 'bg-teal-500',
  },
  'minimal-gray': {
    headerStyle: 'line',
    primary: 'bg-slate-600',
    primaryText: 'text-white',
    accent: 'text-slate-600',
    sectionBg: 'bg-slate-600',
    sectionText: 'text-white',
    border: 'border-slate-300',
    skillPill: 'bg-slate-100 text-slate-700 border border-slate-300',
    bullet: 'bg-slate-500',
  },
};

const DEFAULT_CONFIG: TemplateConfig = TEMPLATES['modern-red'] as TemplateConfig;

const ResumePreview = ({ template = 'modern-red', sections }: ResumePreviewProps) => {
  const currentResume = useResumeStore((s) => s.currentResume);
  const { personalInfo, summary, experience, education, skills } = currentResume;

  const cfg = (TEMPLATES[template] ?? DEFAULT_CONFIG) as TemplateConfig;

  const orderedSections =
    sections && sections.length > 0
      ? sections.filter((s) => s.visible !== false).map((s) => s.id)
      : ['personal', 'summary', 'experience', 'education', 'skills'];

  // ─── BANNER HEADER ─────────────────────────────────────────────────────────
  const renderBannerHeader = () => (
    <header className={`${cfg.primary} ${cfg.primaryText} px-8 py-7`}>
      <h1 className="text-3xl font-extrabold uppercase tracking-widest mb-2 leading-tight">
        {personalInfo.fullName || 'YOUR NAME'}
      </h1>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-90 mt-3">
        {personalInfo.email && <span>{personalInfo.email}</span>}
        {personalInfo.phone && <span>· {personalInfo.phone}</span>}
        {personalInfo.address && <span>· {personalInfo.address}</span>}
        {personalInfo.linkedin && <span>· {personalInfo.linkedin}</span>}
        {personalInfo.website && <span>· {personalInfo.website}</span>}
      </div>
    </header>
  );

  // ─── LINE HEADER (minimal) ─────────────────────────────────────────────────
  const renderLineHeader = () => (
    <header className="pb-5 mb-6 border-b-4 border-gray-900">
      <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900 mb-1">
        {personalInfo.fullName || 'YOUR NAME'}
      </h1>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-500 text-xs mt-2">
        {personalInfo.email && <span>{personalInfo.email}</span>}
        {personalInfo.phone && <span>· {personalInfo.phone}</span>}
        {personalInfo.address && <span>· {personalInfo.address}</span>}
        {personalInfo.linkedin && <span>· {personalInfo.linkedin}</span>}
        {personalInfo.website && <span>· {personalInfo.website}</span>}
      </div>
    </header>
  );

  // ─── SECTION HEADER ────────────────────────────────────────────────────────
  const renderSectionHeader = (label: string) => {
    if (cfg.headerStyle === 'line') {
      return (
        <h2
          className={`text-[11px] font-black ${cfg.accent} uppercase tracking-[0.2em] border-b-2 ${cfg.border} mb-3 pb-1`}
        >
          {label}
        </h2>
      );
    }
    return (
      <div className={`${cfg.sectionBg} ${cfg.sectionText} inline-block px-3 py-1 mb-4 rounded-sm`}>
        <h2 className="text-[10px] font-bold uppercase tracking-widest">{label}</h2>
      </div>
    );
  };

  // ─── SECTION RENDERERS ─────────────────────────────────────────────────────
  const renderSummary = () =>
    summary ? (
      <section className="mb-6" key="summary">
        {renderSectionHeader('Professional Summary')}
        <p className="text-gray-700 whitespace-pre-line text-justify leading-relaxed text-[13px]">
          {summary}
        </p>
      </section>
    ) : null;

  const renderExperience = () =>
    experience && experience.length > 0 ? (
      <section className="mb-6" key="experience">
        {renderSectionHeader('Experience')}
        <div className="space-y-5">
          {experience.map((exp, i) => (
            <div key={i} className="relative pl-4 border-l-2 border-gray-200">
              <div className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ${cfg.bullet}`} />
              <div className="flex flex-wrap justify-between items-baseline mb-0.5 gap-2">
                <h3 className="font-bold text-gray-900 text-[14px]">
                  {exp.position || 'Position'}
                </h3>
                <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                  {exp.startDate || 'Start'} {exp.endDate ? `– ${exp.endDate}` : '– Present'}
                </span>
              </div>
              <div className={`text-[12px] font-semibold mb-1 ${cfg.accent}`}>
                {exp.company || 'Company'}
              </div>
              {exp.description && (
                <p className="text-gray-600 whitespace-pre-line text-justify text-[12px] leading-relaxed">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderEducation = () =>
    education && education.length > 0 ? (
      <section className="mb-6" key="education">
        {renderSectionHeader('Education')}
        <div className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="relative pl-4 border-l-2 border-gray-200">
              <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-gray-400" />
              <div className="flex flex-wrap justify-between items-baseline mb-0.5 gap-2">
                <h3 className="font-bold text-gray-900 text-[14px]">
                  {edu.institution || 'Institution'}
                </h3>
                <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                  {edu.startDate || 'Start'} {edu.endDate ? `– ${edu.endDate}` : ''}
                </span>
              </div>
              <div className="text-[12px] font-medium text-gray-600 italic mb-1">
                {edu.degree || 'Degree'}
              </div>
              {edu.description && (
                <p className="text-[11px] text-gray-500 whitespace-pre-line leading-relaxed mt-1">
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const renderSkills = () =>
    skills && skills.length > 0 ? (
      <section className="mb-4" key="skills">
        {renderSectionHeader('Skills')}
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, i) => (
            <span
              key={i}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-sm ${cfg.skillPill}`}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    ) : null;

  const renderSection = (id: string) => {
    switch (id) {
      case 'summary':
        return renderSummary();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      default:
        return null;
    }
  };

  // ─── SIDEBAR LAYOUT ────────────────────────────────────────────────────────
  if (cfg.headerStyle === 'sidebar') {
    return (
      <motion.div
        id="resume-preview"
        className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] text-[13px] leading-relaxed text-gray-800 mx-auto print:shadow-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex min-h-[297mm]">
          {/* Dark sidebar */}
          <aside className="w-[38%] bg-gray-900 text-white p-7 flex flex-col shrink-0">
            <h1 className="text-2xl font-extrabold uppercase tracking-widest leading-tight mb-1">
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            <div className="w-10 h-1 bg-white opacity-40 mb-5" />
            <div className="space-y-1.5 text-[11px] text-gray-300 mb-8">
              {personalInfo.email && <p className="break-all">{personalInfo.email}</p>}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.address && <p>{personalInfo.address}</p>}
              {personalInfo.linkedin && <p className="break-all">{personalInfo.linkedin}</p>}
              {personalInfo.website && <p className="break-all">{personalInfo.website}</p>}
            </div>

            {skills && skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {education && education.length > 0 && (
              <div>
                <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                  Education
                </h2>
                <div className="space-y-3">
                  {education.map((edu, i) => (
                    <div key={i}>
                      <div className="font-semibold text-[11px] leading-snug">
                        {edu.institution}
                      </div>
                      <div className="text-[10px] text-gray-400 italic">{edu.degree}</div>
                      <div className="text-[10px] text-gray-500">
                        {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 p-7">
            {summary && (
              <section className="mb-6">
                <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.15em] border-b border-gray-300 mb-3 pb-1">
                  Professional Summary
                </h2>
                <p className="text-gray-700 whitespace-pre-line text-justify text-[12px] leading-relaxed">
                  {summary}
                </p>
              </section>
            )}

            {experience && experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.15em] border-b border-gray-300 mb-3 pb-1">
                  Experience
                </h2>
                <div className="space-y-5">
                  {experience.map((exp, i) => (
                    <div key={i} className="relative pl-3 border-l-2 border-gray-200">
                      <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-gray-700" />
                      <div className="flex flex-wrap justify-between items-baseline mb-0.5 gap-2">
                        <h3 className="font-bold text-gray-900 text-[13px]">{exp.position}</h3>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                          {exp.startDate} – {exp.endDate || 'Present'}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-gray-600 mb-1">
                        {exp.company}
                      </div>
                      {exp.description && (
                        <p className="text-gray-600 whitespace-pre-line text-justify text-[11px] leading-relaxed">
                          {exp.description}
                        </p>
                      )}
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

  // ─── DEFAULT LAYOUT (banner + line) ───────────────────────────────────────
  return (
    <motion.div
      id="resume-preview"
      className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] text-[13px] leading-relaxed text-gray-800 mx-auto print:shadow-none print:w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      {cfg.headerStyle === 'banner' ? renderBannerHeader() : renderLineHeader()}

      {/* Body */}
      <div className={cfg.headerStyle === 'banner' ? 'px-8 pt-6 pb-8' : 'px-8 pb-8'}>
        {orderedSections
          .filter((id) => id !== 'personal')
          .map((id) => (
            <div key={id}>{renderSection(id)}</div>
          ))}
      </div>
    </motion.div>
  );
};

export default memo(ResumePreview);
