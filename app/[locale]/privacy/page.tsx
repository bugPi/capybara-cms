import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隐私政策",
  description:
    "了解 Capybara CMS 如何收集、使用与保护您的个人信息与业务数据。",
};

export default function PrivacyPage() {
  return (
    <section className="relative scroll-mt-24 bg-transparent py-24 lg:py-32">
      <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8 lg:px-14">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/"
            className="text-foreground underline-offset-4 hover:underline"
          >
            返回首页
          </Link>
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          隐私政策
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">最近更新：2026 年 4 月</p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-medium text-foreground">1. 概述</h2>
            <p className="mt-3">
              本政策说明在您使用 Capybara CMS（以下简称「本服务」）时，我们如何收集、使用、存储与保护信息。使用本服务即表示您理解并同意本政策；若您不同意，请停止使用。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">
              2. 我们收集的信息
            </h2>
            <p className="mt-3">
              我们可能收集：账户与身份相关信息（如邮箱、姓名或组织名称）、您主动提交的内容与配置、设备与日志类信息（如访问时间、浏览器类型、错误与性能日志），以及您通过集成或 API
              同步的数据（以您实际启用功能为准）。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">
              3. 我们如何使用信息
            </h2>
            <p className="mt-3">
              我们使用上述信息以提供、维护与改进本服务（包括安全、故障排查、客户支持与合规审计）、与您沟通产品更新，以及在法律允许范围内进行内部分析与产品优化。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">
              4. 共享与披露
            </h2>
            <p className="mt-3">
              除法律法规要求、经您授权或为履行合同所必需外，我们不会向第三方出售您的个人信息。我们可能委托基础设施或分析类服务商处理数据，并要求其采取适当保护措施。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">
              5. 安全与保留
            </h2>
            <p className="mt-3">
              我们采取合理的技术与管理措施保护数据安全。我们会在实现本政策所述目的所必需的期限内保留信息，除非法律要求或允许更长的保留期。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">6. 您的权利</h2>
            <p className="mt-3">
              在适用法律允许的范围内，您可就个人信息行使访问、更正、删除、限制处理等权利。您可通过本政策末尾的联系方式与我们联系。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">7. 变更</h2>
            <p className="mt-3">
              我们可能不时更新本政策；重大变更时将通过站内提示或您提供的联系方式告知。更新后的政策自发布之日起生效。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">8. 联系我们</h2>
            <p className="mt-3">
              若对本政策有疑问，请通过{" "}
              <a
                href="mailto:sales@capybara-cms.example.com"
                className="text-foreground underline-offset-4 hover:underline"
              >
                sales@capybara-cms.example.com
              </a>{" "}
              与我们联系。
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
