"use client";

import React from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EditorialSection } from "@/components/EditorialSection";
import { FaqSection } from "@/components/FaqSection";
import { RelatedTools } from "@/components/RelatedTools";

export default function ToolLayout({ 
  children, 
  title, 
  description, 
  editorialTitle, 
  editorialBody, 
  faqs 
}) {
  return (
    <div className="container mx-auto px-4 max-w-5xl py-8">
      <Breadcrumb 
        items={[
          { label: "Tools", href: "/tools" },
          { label: title || "Tool", href: "#" }
        ]} 
      />

      {/* Main Tool Content Container */}
      <div className="mt-8">
        {children}
      </div>

      {editorialTitle && editorialBody && (
        <EditorialSection title={editorialTitle} body={editorialBody} />
      )}

      {faqs && faqs.length > 0 && (
        <FaqSection faqs={faqs.map(f => ({ question: f.q || f.question, answer: f.a || f.answer }))} />
      )}

      <RelatedTools currentSlug="" />
    </div>
  );
}
