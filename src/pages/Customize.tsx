import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSiteContent,
  SiteContent,
  useSiteContent,
} from "@/lib/site-content";
import { logoutAdmin } from "@/lib/admin-auth";

const listToText = (items: string[]) => items.join("\n");
const textToList = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const Customize = () => {
  const navigate = useNavigate();
  const { siteContent, updateSiteContent, resetSiteContent } = useSiteContent();
  const [draft, setDraft] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    setDraft(siteContent);
  }, [siteContent]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Admin / Customize
            </p>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Chỉnh nội dung website
            </h1>
            <p className="text-sm text-muted-foreground">
              Dùng được trên cả laptop và mobile. Lưu xong là trang chủ lấy nội dung mới ngay.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Xem website
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                logoutAdmin();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetSiteContent();
                setDraft(defaultSiteContent);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="cta" onClick={() => updateSiteContent(draft)}>
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="hero" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="h-auto min-w-max gap-1 rounded-lg p-1">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="intro">Giới thiệu</TabsTrigger>
              <TabsTrigger value="objectives">Mục tiêu</TabsTrigger>
              <TabsTrigger value="audience">Đối tượng</TabsTrigger>
              <TabsTrigger value="partners">Đối tác</TabsTrigger>
              <TabsTrigger value="cta">CTA</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hero">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Header</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={draft.header.introLabel}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, introLabel: e.target.value },
                      })
                    }
                    placeholder="Giới thiệu"
                  />
                  <Input
                    value={draft.header.objectivesLabel}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, objectivesLabel: e.target.value },
                      })
                    }
                    placeholder="Mục tiêu"
                  />
                  <Input
                    value={draft.header.timelineLabel}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, timelineLabel: e.target.value },
                      })
                    }
                    placeholder="Lộ trình"
                  />
                  <Input
                    value={draft.header.benefitsLabel}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, benefitsLabel: e.target.value },
                      })
                    }
                    placeholder="Quyền lợi"
                  />
                  <Input
                    value={draft.header.partnersLabel}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, partnersLabel: e.target.value },
                      })
                    }
                    placeholder="Đối tác"
                  />
                  <Input
                    value={draft.header.ctaLabel}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, ctaLabel: e.target.value },
                      })
                    }
                    placeholder="Nút đăng ký"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={draft.hero.badge}
                    onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, badge: e.target.value } })}
                    placeholder="Badge"
                  />
                  <Input
                    value={draft.hero.titleLine1}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, titleLine1: e.target.value } })
                    }
                    placeholder="Dòng tiêu đề 1"
                  />
                  <Input
                    value={draft.hero.titleLine2}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, titleLine2: e.target.value } })
                    }
                    placeholder="Dòng tiêu đề 2"
                  />
                  <Textarea
                    value={draft.hero.description}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, description: e.target.value } })
                    }
                    placeholder="Mô tả"
                  />
                  <Input
                    value={draft.hero.ctaLabel}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, ctaLabel: e.target.value } })
                    }
                    placeholder="Nút hero"
                  />
                  <Input
                    value={draft.hero.helperText}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, helperText: e.target.value } })
                    }
                    placeholder="Dòng phụ nhỏ"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="intro">
            <Card>
              <CardHeader>
                <CardTitle>Giới thiệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={draft.intro.badge}
                  onChange={(e) => setDraft({ ...draft, intro: { ...draft.intro, badge: e.target.value } })}
                />
                <Input
                  value={draft.intro.title}
                  onChange={(e) => setDraft({ ...draft, intro: { ...draft.intro, title: e.target.value } })}
                />
                <Textarea
                  value={draft.intro.description1}
                  onChange={(e) =>
                    setDraft({ ...draft, intro: { ...draft.intro, description1: e.target.value } })
                  }
                />
                <Textarea
                  value={draft.intro.description2}
                  onChange={(e) =>
                    setDraft({ ...draft, intro: { ...draft.intro, description2: e.target.value } })
                  }
                />
                <Input
                  value={draft.intro.ctaLabel}
                  onChange={(e) =>
                    setDraft({ ...draft, intro: { ...draft.intro, ctaLabel: e.target.value } })
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objectives">
            <Card>
              <CardHeader>
                <CardTitle>Mục tiêu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={draft.objectives.badge}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      objectives: { ...draft.objectives, badge: e.target.value },
                    })
                  }
                />
                <Input
                  value={draft.objectives.title}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      objectives: { ...draft.objectives, title: e.target.value },
                    })
                  }
                />
                <Textarea
                  value={draft.objectives.description}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      objectives: { ...draft.objectives, description: e.target.value },
                    })
                  }
                />
                <Textarea
                  className="min-h-[220px]"
                  value={listToText(draft.objectives.items)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      objectives: { ...draft.objectives, items: textToList(e.target.value) },
                    })
                  }
                  placeholder="Mỗi dòng là một mục tiêu"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <Card>
              <CardHeader>
                <CardTitle>Đối tượng tham gia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={draft.audience.badge}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      audience: { ...draft.audience, badge: e.target.value },
                    })
                  }
                />
                <Input
                  value={draft.audience.title}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      audience: { ...draft.audience, title: e.target.value },
                    })
                  }
                />
                <Textarea
                  className="min-h-[260px]"
                  value={listToText(draft.audience.items)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      audience: { ...draft.audience, items: textToList(e.target.value) },
                    })
                  }
                  placeholder="Mỗi dòng là một đối tượng"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Đối tác doanh nghiệp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={draft.partners.badge}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        partners: { ...draft.partners, badge: e.target.value },
                      })
                    }
                  />
                  <Input
                    value={draft.partners.businessTitle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        partners: { ...draft.partners, businessTitle: e.target.value },
                      })
                    }
                  />
                  <Textarea
                    value={draft.partners.businessDescription}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        partners: { ...draft.partners, businessDescription: e.target.value },
                      })
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Đối tác trường học</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={draft.partners.schoolTitle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        partners: { ...draft.partners, schoolTitle: e.target.value },
                      })
                    }
                  />
                  <Textarea
                    value={draft.partners.schoolDescription}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        partners: { ...draft.partners, schoolDescription: e.target.value },
                      })
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cta">
            <Card>
              <CardHeader>
                <CardTitle>CTA đăng ký</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={draft.cta.title}
                  onChange={(e) => setDraft({ ...draft, cta: { ...draft.cta, title: e.target.value } })}
                />
                <Textarea
                  value={draft.cta.description}
                  onChange={(e) =>
                    setDraft({ ...draft, cta: { ...draft.cta, description: e.target.value } })
                  }
                />
                <Input
                  value={draft.cta.ctaLabel}
                  onChange={(e) =>
                    setDraft({ ...draft, cta: { ...draft.cta, ctaLabel: e.target.value } })
                  }
                />
                <Input
                  value={draft.cta.secondaryLabel}
                  onChange={(e) =>
                    setDraft({ ...draft, cta: { ...draft.cta, secondaryLabel: e.target.value } })
                  }
                />
                <Textarea
                  value={listToText(draft.cta.highlights)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      cta: { ...draft.cta, highlights: textToList(e.target.value) },
                    })
                  }
                  placeholder="Mỗi dòng là một điểm nhấn"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={draft.footer.title}
                  onChange={(e) =>
                    setDraft({ ...draft, footer: { ...draft.footer, title: e.target.value } })
                  }
                />
                <Textarea
                  value={draft.footer.description}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      footer: { ...draft.footer, description: e.target.value },
                    })
                  }
                />
                <Input
                  value={draft.footer.copyright}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      footer: { ...draft.footer, copyright: e.target.value },
                    })
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Customize;
