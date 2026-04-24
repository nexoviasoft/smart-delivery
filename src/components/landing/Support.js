import React from "react";

const Support = () => {
  const faqs = [
    { q: "How do I connect my WooCommerce store?", a: "Simply install our native plugin and enter your API keys from the Smart Growth Manager dashboard." },
    { q: "Can I use multiple courier services?", a: "Yes, you can integrate multiple couriers and choose which one to use for each order or set up automation rules." },
    { q: "How does the WhatsApp automation work?", a: "Once an order status changes, our system automatically triggers a pre-configured WhatsApp message to the customer." },
    { q: "Is my data secure?", a: "We use enterprise-grade encryption and secure API connections to ensure all your business and customer data is protected." }
  ];

  return (
    <section id="support" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-bold uppercase tracking-widest text-indigo-600">Support</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">We're here to help you grow</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h3>
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-indigo-100 transition-all">
                <h4 className="font-bold text-slate-900 mb-2 flex gap-3">
                  <span className="text-indigo-600">Q.</span> {faq.q}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed ml-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
          
          <div className="bg-indigo-600 rounded-[2rem] p-6 sm:p-10 text-white shadow-2xl shadow-indigo-200">
            <h3 className="text-3xl font-bold mb-6">Still have questions?</h3>
            <p className="text-indigo-100 mb-8 leading-relaxed">
              Our support team is available 24/7 to help you with any technical issues or business inquiries.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">📧</div>
                <div>
                  <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Email Support</p>
                  <p className="font-bold">support@smartgrowth.manager</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">💬</div>
                <div>
                  <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Live Chat</p>
                  <p className="font-bold">Chat with us on WhatsApp</p>
                </div>
              </div>
            </div>
            <button className="mt-10 w-full rounded-2xl bg-white py-4 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-all">
              Contact Us Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Support;
