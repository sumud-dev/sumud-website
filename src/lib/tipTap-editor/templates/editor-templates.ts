import { TemplateType } from '../../types/editor';

/**
 * Template content generator
 * Pure functions that return HTML content for templates
 */

export const templateContent: Record<TemplateType, string> = {
  card: `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3>Card Title</h3>
      <p>Add your content here. This card component is perfect for highlighting important information.</p>
    </div>
  `,
  
  twoColumn: `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 16px 0;">
      <div>
        <h3>Left Column</h3>
        <p>Content for the left side goes here.</p>
      </div>
      <div>
        <h3>Right Column</h3>
        <p>Content for the right side goes here.</p>
      </div>
    </div>
  `,
  
  threeColumn: `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 16px 0;">
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h4>Column 1</h4>
        <p>First column content</p>
      </div>
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h4>Column 2</h4>
        <p>Second column content</p>
      </div>
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h4>Column 3</h4>
        <p>Third column content</p>
      </div>
    </div>
  `,
  
  hero: `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 40px; border-radius: 12px; text-align: center; margin: 24px 0;">
      <h1 style="color: white; font-size: 3em; margin-bottom: 16px;">Welcome to Your Platform</h1>
      <p style="font-size: 1.25em; margin-bottom: 32px;">Start creating amazing content today</p>
      <a href="#" style="background: white; color: #667eea; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Get Started</a>
    </div>
  `,
  
  features: `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 24px 0;">
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; text-align: center; transition: transform 0.2s;">
        <div style="font-size: 3em; margin-bottom: 16px;">🚀</div>
        <h3>Fast & Reliable</h3>
        <p style="color: #6b7280;">Lightning-fast performance you can count on</p>
      </div>
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; text-align: center; transition: transform 0.2s;">
        <div style="font-size: 3em; margin-bottom: 16px;">🔒</div>
        <h3>Secure</h3>
        <p style="color: #6b7280;">Enterprise-grade security built-in</p>
      </div>
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; text-align: center; transition: transform 0.2s;">
        <div style="font-size: 3em; margin-bottom: 16px;">💎</div>
        <h3>Premium Quality</h3>
        <p style="color: #6b7280;">Best-in-class features and support</p>
      </div>
    </div>
  `,
  
  pricing: `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; margin: 32px 0;">
      <div style="border: 2px solid #e5e7eb; border-radius: 16px; padding: 36px; text-align: center;">
        <h3 style="font-size: 1.5em; margin-bottom: 12px;">Starter</h3>
        <div style="font-size: 3em; font-weight: bold; margin: 20px 0;">$9<span style="font-size: 0.4em; color: #6b7280; font-weight: normal;">/month</span></div>
        <ul style="list-style: none; padding: 0; margin: 24px 0; text-align: left;">
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ 10 Projects</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ Basic Support</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ 5GB Storage</li>
        </ul>
        <a href="#" style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Choose Plan</a>
      </div>
      <div style="border: 3px solid #3b82f6; border-radius: 16px; padding: 36px; text-align: center; position: relative; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);">
        <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 6px 20px; border-radius: 20px; font-size: 0.85em; font-weight: 600;">POPULAR</div>
        <h3 style="font-size: 1.5em; margin-bottom: 12px;">Professional</h3>
        <div style="font-size: 3em; font-weight: bold; margin: 20px 0;">$29<span style="font-size: 0.4em; color: #6b7280; font-weight: normal;">/month</span></div>
        <ul style="list-style: none; padding: 0; margin: 24px 0; text-align: left;">
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ Unlimited Projects</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ Priority Support</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ 50GB Storage</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ Advanced Features</li>
        </ul>
        <a href="#" style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Choose Plan</a>
      </div>
      <div style="border: 2px solid #e5e7eb; border-radius: 16px; padding: 36px; text-align: center;">
        <h3 style="font-size: 1.5em; margin-bottom: 12px;">Enterprise</h3>
        <div style="font-size: 3em; font-weight: bold; margin: 20px 0;">$99<span style="font-size: 0.4em; color: #6b7280; font-weight: normal;">/month</span></div>
        <ul style="list-style: none; padding: 0; margin: 24px 0; text-align: left;">
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ Everything in Pro</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ Dedicated Support</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ Unlimited Storage</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✓ Custom Integrations</li>
        </ul>
        <a href="#" style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">Contact Sales</a>
      </div>
    </div>
  `,
  
  testimonial: `
    <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 40px; margin: 24px 0; background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);">
      <div style="font-size: 4em; color: #3b82f6; line-height: 0.5; margin-bottom: 20px;">"</div>
      <p style="font-size: 1.25em; font-style: italic; color: #374151; margin: 20px 0; line-height: 1.6;">This product has completely transformed how we work. The features are intuitive and powerful. Highly recommended!</p>
      <div style="display: flex; align-items: center; margin-top: 32px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin-right: 16px;"></div>
        <div>
          <div style="font-weight: 600; font-size: 1.1em; color: #111827;">Sarah Johnson</div>
          <div style="color: #6b7280; font-size: 0.95em;">CEO, Tech Innovations Inc.</div>
        </div>
      </div>
    </div>
  `,
  
  faq: `
    <div style="margin: 24px 0;">
      <details style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 16px; cursor: pointer;">
        <summary style="font-weight: 600; font-size: 1.1em; cursor: pointer; user-select: none; list-style: none; display: flex; justify-content: space-between; align-items: center;">
          How do I get started?
          <span style="font-size: 1.5em; color: #6b7280;">+</span>
        </summary>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6; color: #6b7280; line-height: 1.6;">
          Getting started is easy! Simply sign up for an account, choose your plan, and follow our interactive onboarding guide. You'll be up and running in minutes.
        </div>
      </details>
      <details style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 16px; cursor: pointer;">
        <summary style="font-weight: 600; font-size: 1.1em; cursor: pointer; user-select: none; list-style: none; display: flex; justify-content: space-between; align-items: center;">
          What payment methods do you accept?
          <span style="font-size: 1.5em; color: #6b7280;">+</span>
        </summary>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6; color: #6b7280; line-height: 1.6;">
          We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are processed securely.
        </div>
      </details>
      <details style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 16px; cursor: pointer;">
        <summary style="font-weight: 600; font-size: 1.1em; cursor: pointer; user-select: none; list-style: none; display: flex; justify-content: space-between; align-items: center;">
          Can I cancel my subscription anytime?
          <span style="font-size: 1.5em; color: #6b7280;">+</span>
        </summary>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6; color: #6b7280; line-height: 1.6;">
          Yes! You can cancel your subscription at any time from your account settings. No questions asked, no hidden fees.
        </div>
      </details>
    </div>
  `,
  
  timeline: `
    <div style="position: relative; padding-left: 40px; margin: 32px 0;">
      <div style="position: absolute; left: 15px; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);"></div>
      <div style="position: relative; margin-bottom: 40px;">
        <div style="position: absolute; left: -32px; width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; border: 3px solid white; box-shadow: 0 0 0 3px #3b82f6;"></div>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h4 style="color: #3b82f6; font-size: 1.1em; margin-bottom: 8px;">2024 - Present</h4>
          <h3 style="margin-bottom: 12px;">Current Phase</h3>
          <p style="color: #6b7280;">We're currently focused on expanding our platform and adding new innovative features based on customer feedback.</p>
        </div>
      </div>
      <div style="position: relative; margin-bottom: 40px;">
        <div style="position: absolute; left: -32px; width: 12px; height: 12px; border-radius: 50%; background: #8b5cf6; border: 3px solid white; box-shadow: 0 0 0 3px #8b5cf6;"></div>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h4 style="color: #8b5cf6; font-size: 1.1em; margin-bottom: 8px;">2023</h4>
          <h3 style="margin-bottom: 12px;">Major Launch</h3>
          <p style="color: #6b7280;">Successfully launched version 2.0 with advanced features and improved user experience.</p>
        </div>
      </div>
      <div style="position: relative;">
        <div style="position: absolute; left: -32px; width: 12px; height: 12px; border-radius: 50%; background: #a855f7; border: 3px solid white; box-shadow: 0 0 0 3px #a855f7;"></div>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h4 style="color: #a855f7; font-size: 1.1em; margin-bottom: 8px;">2022</h4>
          <h3 style="margin-bottom: 12px;">The Beginning</h3>
          <p style="color: #6b7280;">Started our journey with a vision to revolutionize the industry and make a difference.</p>
        </div>
      </div>
    </div>
  `,
  
  'callout-info': `
    <div style="border-left: 4px solid #3b82f6; background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); padding: 20px 24px; margin: 20px 0; border-radius: 8px;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 1.5em; margin-top: 2px;">ℹ️</div>
        <div>
          <h4 style="color: #1e40af; margin-bottom: 8px; font-size: 1.1em;">Information</h4>
          <p style="color: #374151; margin: 0; line-height: 1.6;">Add your informational content here. This callout is perfect for helpful tips and guidance.</p>
        </div>
      </div>
    </div>
  `,
  
  'callout-warning': `
    <div style="border-left: 4px solid #f59e0b; background: linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%); padding: 20px 24px; margin: 20px 0; border-radius: 8px;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 1.5em; margin-top: 2px;">⚠️</div>
        <div>
          <h4 style="color: #92400e; margin-bottom: 8px; font-size: 1.1em;">Warning</h4>
          <p style="color: #374151; margin: 0; line-height: 1.6;">Add your warning message here. Use this to highlight important considerations or potential issues.</p>
        </div>
      </div>
    </div>
  `,
  
  'callout-success': `
    <div style="border-left: 4px solid #10b981; background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); padding: 20px 24px; margin: 20px 0; border-radius: 8px;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 1.5em; margin-top: 2px;">✅</div>
        <div>
          <h4 style="color: #065f46; margin-bottom: 8px; font-size: 1.1em;">Success</h4>
          <p style="color: #374151; margin: 0; line-height: 1.6;">Add your success message here. Perfect for confirming completed actions or positive outcomes.</p>
        </div>
      </div>
    </div>
  `,
  
  'callout-error': `
    <div style="border-left: 4px solid #ef4444; background: linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); padding: 20px 24px; margin: 20px 0; border-radius: 8px;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 1.5em; margin-top: 2px;">❌</div>
        <div>
          <h4 style="color: #991b1b; margin-bottom: 8px; font-size: 1.1em;">Error</h4>
          <p style="color: #374151; margin: 0; line-height: 1.6;">Add your error message here. Use this to highlight critical issues that need immediate attention.</p>
        </div>
      </div>
    </div>
  `,
};

/**
 * Generate table HTML
 */
export const generateTable = (rows: number, cols: number): string => {
  const headers = Array.from({ length: cols }, (_, i) => `<th>Header ${i + 1}</th>`).join('');
  const cells = Array.from({ length: cols }, (_, i) => `<td>Cell ${i + 1}</td>`).join('');
  const bodyRows = Array.from({ length: rows }, () => `<tr>${cells}</tr>`).join('');
  
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb;">
      <thead>
        <tr style="background: #f9fafb;">${headers}</tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  `;
};

/**
 * Get template by type
 */
export const getTemplate = (type: TemplateType): string => {
  return templateContent[type] || '';
};

/**
 * Sanitize HTML (basic - in production use DOMPurify)
 */
export const sanitizeHtml = (html: string): string => {
  // In production, use a proper library like DOMPurify
  return html;
};
