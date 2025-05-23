import React from 'react';
import '../../styles/loader.css';

interface CompanyLogoProps {
  className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ className }) => {
  return (
    <div className={className}>
      {/* From Uiverse.io by RafaM-dev */}
      <section className="loader">
        <div>
          <div>
            <span className="one h6"></span>
            <span className="two h3"></span>
          </div>
        </div>

        <div>
          <div>
            <span className="one h1"></span>
          </div>
        </div>

        <div>
          <div>
            <span className="two h2"></span>
          </div>
        </div>
        
        <div>
          <div>
            <span className="one h4"></span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyLogo;
