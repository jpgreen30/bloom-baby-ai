import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQAccordion = () => {
  const faqs = [
    {
      question: "Is this really free?",
      answer: "Yes! No credit card required. The $400 in essentials comes from our brand partners who want to support new parents. You'll get instant access to exclusive coupon codes and partner offers.",
    },
    {
      question: "How do I receive the $400 in products?",
      answer: "After signing up, you'll get instant access to exclusive coupon codes and partner offers worth $400+ from trusted baby brands. You can use these immediately in our marketplace and with our partner stores.",
    },
    {
      question: "What if I already have a baby tracking app?",
      answer: "Our AI predictions are 3x more accurate than competitors. Plus, no other app offers $400 in free products! We also integrate with Google Calendar and have a built-in marketplace, making us the most comprehensive solution.",
    },
    {
      question: "Is my baby's data secure?",
      answer: "Absolutely. We use bank-level encryption and never sell your data. We're HIPAA compliant and take privacy seriously. Your baby's information is protected with the highest security standards.",
    },
    {
      question: "Can I invite my partner/family?",
      answer: "Yes! Free accounts support unlimited family sharing. Both parents and grandparents can track milestones, receive updates, and share in your baby's journey together.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-foreground font-semibold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQAccordion;
