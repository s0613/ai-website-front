import MyPageLayout from "@/pages/my/MyPageLayout";

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return <MyPageLayout>{children}</MyPageLayout>;
}
