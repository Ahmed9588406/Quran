"use client";
import React from "react";
import { Pencil } from "lucide-react";
import Image from "next/image";

interface WorkExperience {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  isAddNew?: boolean;
}

interface PlaceLived {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  isAddNew?: boolean;
}

interface ContactInfo {
  id: string;
  icon: string;
  label: string;
  value?: string;
  isAddNew?: boolean;
}

interface AboutSectionProps {
  workExperiences: WorkExperience[];
  placesLived: PlaceLived[];
  contactInfo: ContactInfo[
    
  ];
  isOwnProfile?: boolean;
}

export default function AboutSection({
  workExperiences,
  placesLived,
  contactInfo,
  isOwnProfile = true,
}: AboutSectionProps) {
  // helper to map contact item to an icon (uses provided icon if present)
  const getContactIcon = (c: ContactInfo) => {
    if (c.icon) return c.icon;

    const label = (c.label || "").toLowerCase();
    if (label.includes("phone") || label.includes("mobile"))
      return "/icons/user_profile/phone.svg";
    if (label.includes("email")) return "/icons/user_profile/email.svg";
    if (label.includes("website") || label.includes("site"))
      return "/icons/user_profile/info.svg";
    if (label.includes("address") || label.includes("location"))
      return "/icons/user_profile/info.svg";
    // fallback
    return "/icons/user_profile/info.svg";
  };

  return (
    <div className="space-y-6">
      {/* Work Section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Work</h2>
        <div className="space-y-3">
          {workExperiences.map((work) => (
            <div
              key={work.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/icons/user_profile/work.svg"
                  alt=""
                  className="w-10 h-10"
                  width={50}
                  height={30}
                />
                <div>
                  {work.isAddNew ? (
                    <span className="text-sm text-[#7b2030] font-medium cursor-pointer hover:underline">
                      {work.title}
                    </span>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-gray-900">
                        {work.title}
                      </div>
                      {work.subtitle && (
                        <div className="text-xs text-gray-500">
                          {work.subtitle}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {isOwnProfile && !work.isAddNew && (
                <button
                  aria-label="Edit"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Places Lived Section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Places Lived</h2>
        <div className="space-y-3">
          {placesLived.map((place) => (
            <div
              key={place.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fff0ed] flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/icons/user_profile/place.svg"
                    alt=""
                    className="w-10 h-10"
                    width={50}
                    height={30}
                  />
                </div>
                <div>
                  {place.isAddNew ? (
                    <span className="text-sm text-[#7b2030] font-medium cursor-pointer hover:underline">
                      {place.title}
                    </span>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-gray-900">
                        {place.title}
                      </div>
                      {place.subtitle && (
                        <div className="text-xs text-gray-500">
                          {place.subtitle}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {isOwnProfile && !place.isAddNew && (
                <button
                  aria-label="Edit"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info Section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact Info</h2>
        <div className="space-y-3">
          {contactInfo.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                  <Image
                    src={getContactIcon(contact)}
                    alt={contact.label}
                    width={50}
                    height={50}
                    className="object-contain w-10 h-10"
                  />
                
                <div>
                  {contact.isAddNew ? (
                    <span className="text-sm text-[#7b2030] font-medium cursor-pointer hover:underline">
                      {contact.label}
                    </span>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.label}
                      </div>
                      {contact.value && (
                        <div className="text-xs text-gray-500">
                          {contact.value}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {isOwnProfile && !contact.isAddNew && (
                <button
                  aria-label="Edit"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
