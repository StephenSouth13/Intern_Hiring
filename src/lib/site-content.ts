import { useEffect, useState } from "react";

export const SITE_CONTENT_STORAGE_KEY = "hkdn-site-content";

export type SiteContent = {
  header: {
    introLabel: string;
    objectivesLabel: string;
    timelineLabel: string;
    benefitsLabel: string;
    partnersLabel: string;
    ctaLabel: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    ctaLabel: string;
    helperText: string;
  };
  intro: {
    badge: string;
    title: string;
    description1: string;
    description2: string;
    ctaLabel: string;
  };
  objectives: {
    badge: string;
    title: string;
    description: string;
    items: string[];
  };
  audience: {
    badge: string;
    title: string;
    items: string[];
  };
  partners: {
    badge: string;
    businessTitle: string;
    businessDescription: string;
    schoolTitle: string;
    schoolDescription: string;
  };
  cta: {
    title: string;
    description: string;
    ctaLabel: string;
    secondaryLabel: string;
    highlights: string[];
  };
  footer: {
    title: string;
    description: string;
    copyright: string;
  };
};

export const defaultSiteContent: SiteContent = {
  header: {
    introLabel: "Giới thiệu",
    objectivesLabel: "Mục tiêu",
    timelineLabel: "Lộ trình",
    benefitsLabel: "Quyền lợi",
    partnersLabel: "Đối tác",
    ctaLabel: "Đăng ký",
  },
  hero: {
    badge: "Chương trình đặc biệt 2025",
    titleLine1: "Học Kỳ",
    titleLine2: "Doanh Nghiệp 2025",
    description:
      "Chương trình tạo cơ hội để sinh viên hòa mình vào môi trường doanh nghiệp thực tế, trải nghiệm công việc thật, dự án thật và thử thách thật.",
    ctaLabel: "ĐĂNG KÝ NGAY",
    helperText: "Số lượng có hạn • Đăng ký sớm để đảm bảo suất",
  },
  intro: {
    badge: "Giới thiệu chương trình",
    title: "Cầu nối hiệu quả giữa sinh viên và doanh nghiệp",
    description1:
      "Học Kỳ Doanh Nghiệp (HKDN) là chương trình đào tạo thực hành thực tế tại doanh nghiệp, tạo cầu nối hiệu quả giữa sinh viên – nhà trường – doanh nghiệp.",
    description2:
      "Chương trình mang đến cơ hội trải nghiệm môi trường làm việc chuyên nghiệp, phát triển kỹ năng thực tế và xây dựng mạng lưới quan hệ vững chắc.",
    ctaLabel: "Tìm hiểu thêm",
  },
  objectives: {
    badge: "Mục tiêu chương trình",
    title: "5 Mục tiêu chính",
    description:
      "Chương trình được thiết kế để đạt được những mục tiêu quan trọng nhất cho sự phát triển của sinh viên",
    items: [
      "Giúp sinh viên tiếp cận môi trường làm việc thực tế",
      "Phát triển ASK (Attitude – Skill – Knowledge)",
      "Kết nối sinh viên với các doanh nghiệp hàng đầu",
      "Nâng cao khả năng thích ứng với công việc thực tế",
      "Xây dựng network chuyên nghiệp và cơ hội nghề nghiệp",
    ],
  },
  audience: {
    badge: "Đối tượng tham gia",
    title: "Ai phù hợp với chương trình?",
    items: [
      "Sinh viên đại học/cao đẳng năm 2-4",
      "Có mong muốn phát triển sự nghiệp trong lĩnh vực kinh doanh",
      "Quan tâm đến Sales, Marketing, AI ứng dụng",
      "Có khả năng tham gia học tập và thực hành thực tế",
      "Cam kết hoàn thành đầy đủ chương trình",
    ],
  },
  partners: {
    badge: "Đối tác tin cậy",
    businessTitle: "Đối tác Doanh nghiệp",
    businessDescription:
      "Các doanh nghiệp đồng hành cùng chương trình trong đào tạo, mentoring và triển khai dự án thực tế cho sinh viên.",
    schoolTitle: "Đối tác Trường học",
    schoolDescription:
      "Các trường học phối hợp cùng chương trình để kết nối sinh viên với môi trường doanh nghiệp và cơ hội thực hành thực tế.",
  },
  cta: {
    title: "Sẵn sàng bắt đầu hành trình của bạn?",
    description:
      "Đừng bỏ lỡ cơ hội tham gia chương trình Học Kỳ Doanh Nghiệp 2025. Đăng ký ngay hôm nay để đảm bảo suất học!",
    ctaLabel: "ĐĂNG KÝ NGAY",
    secondaryLabel: "Tải thông tin chi tiết",
    highlights: ["Chất lượng cao", "Số lượng có hạn", "Đăng ký sớm"],
  },
  footer: {
    title: "Học Kỳ Doanh Nghiệp 2025",
    description:
      "Cầu nối hiệu quả giữa sinh viên – nhà trường – doanh nghiệp. Trải nghiệm thực tế, phát triển bền vững.",
    copyright: "© 2025 HKDN Program • All Rights Reserved",
  },
};

export function loadSiteContent() {
  if (typeof window === "undefined") return defaultSiteContent;

  const raw = window.localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
  if (!raw) return defaultSiteContent;

  try {
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return {
      ...defaultSiteContent,
      ...parsed,
      header: { ...defaultSiteContent.header, ...parsed.header },
      hero: { ...defaultSiteContent.hero, ...parsed.hero },
      intro: { ...defaultSiteContent.intro, ...parsed.intro },
      objectives: { ...defaultSiteContent.objectives, ...parsed.objectives },
      audience: { ...defaultSiteContent.audience, ...parsed.audience },
      partners: { ...defaultSiteContent.partners, ...parsed.partners },
      cta: { ...defaultSiteContent.cta, ...parsed.cta },
      footer: { ...defaultSiteContent.footer, ...parsed.footer },
    };
  } catch {
    return defaultSiteContent;
  }
}

export function saveSiteContent(content: SiteContent) {
  window.localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(content));
}

export function clearSiteContent() {
  window.localStorage.removeItem(SITE_CONTENT_STORAGE_KEY);
}

export function useSiteContent() {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    setSiteContent(loadSiteContent());
  }, []);

  return {
    siteContent,
    updateSiteContent(nextContent: SiteContent) {
      setSiteContent(nextContent);
      saveSiteContent(nextContent);
    },
    resetSiteContent() {
      clearSiteContent();
      setSiteContent(defaultSiteContent);
    },
  };
}
