import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Features</li>
              <li>Pricing</li>
              <li>Integrations</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Documentation</li>
              <li>Help Center</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p>© 2026 Smart Growth Manager. All rights reserved.</p>
            <p>
              Developed by{" "}
              <a 
                href="https://www.nexoviasoft.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 font-medium hover:text-indigo-600 transition-colors"
              >
                Nexoviasoft
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <span>Twitter</span>
            <span>LinkedIn</span>
            <span>GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
