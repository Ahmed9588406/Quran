"use client";
import React from "react";
import { MapPin, Briefcase, Mail, Phone } from "lucide-react";

interface InfoItem {
  id: string;
  icon?: string;
  title: string;
  subtitle?: string;
}

interface AboutSectionProps {
  workExperiences: InfoItem[];
  placesLived: InfoItem[];
  contactInfo: InfoItem[];
  isOwnProfile?: boolean;
}

export default function AboutSection({
  workExperiences,
  placesLived,
  contactInfo,
  isOwnProfile = false,
}: AboutSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-[#f0e6e5] p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">About</h2>

      {/* Work Experience */}
      {workExperiences.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Work</h3>
          <div className="space-y-3">
            {workExperiences.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Places Lived */}
      {placesLived.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Places Lived</h3>
          <div className="space-y-3">
            {placesLived.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {contactInfo.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Info</h3>
          <div className="space-y-3">
            {contactInfo.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.icon === "email" ? (
                  <Mail className="w-5 h-5 text-gray-400" />
                ) : (
                  <Phone className="w-5 h-5 text-gray-400" />
                )}
                <p className="text-sm text-gray-900">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {workExperiences.length === 0 && placesLived.length === 0 && contactInfo.length === 0 && (
        <p className="text-gray-500 text-sm">No information available</p>
      )}
    </div>
  );
}
