import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "服务条款",
  description:
    "使用 Capybara CMS 时需遵守的服务条款与使用规则。",
};

export default function TermsPage() {
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
          服务条款
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">最近更新：2026 年 4 月</p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-medium text-foreground">1. 接受条款</h2>
            <p className="mt-3">
              欢迎使用 Capybara CMS（以下简称「本服务」）。访问或使用本服务即表示您同意本条款及我们不时发布的补充规则。若您代表组织使用，您声明有权约束该组织接受本条款。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">2. 账户与访问</h2>
            <p className="mt-3">
              您应妥善保管账户凭证，对账户下的活动负责。若发现未经授权使用，请立即通知我们。我们可在合理情形下暂停或终止违反条款的访问。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">3. 内容与许可</h2>
            <p className="mt-3">
              您保留对您上传或创建的内容的权利；为提供本服务，您授予我们在全球范围内、非独占的许可，以便存储、处理、展示与分发该等内容（以实际功能为限）。您应确保内容不侵犯第三方权利且符合适用法律。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">4. 可接受使用</h2>
            <p className="mt-3">
              您不得将本服务用于违法、欺诈、骚扰、传播恶意代码、未经授权扫描或攻击系统，或干扰其他用户正常使用等行为。我们可对违规内容或行为采取删除、限制或终止服务等措施。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">5. 服务变更与可用性</h2>
            <p className="mt-3">
              我们可能因维护、升级或业务调整变更、暂停或终止部分功能。在合理可行时，我们会通过适当方式告知重大变更。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">6. 免责声明与责任限制</h2>
            <p className="mt-3">
              在适用法律允许的最大范围内，本服务按「现状」提供。我们对因使用或无法使用本服务而产生的间接、附带或后果性损害不承担责任，除非法律强制另有规定。具体责任上限以与您签订的商务协议为准；若无单独协议，以通常合理范围为限。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">7. 条款更新</h2>
            <p className="mt-3">
              我们可能修订本条款；修订后继续使用本服务即视为接受更新版本。若您不同意修订，请停止使用本服务。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">8. 联系我们</h2>
            <p className="mt-3">
              有关本条款的问题，请通过{" "}
              <a
                href="mailto:sales@capybara-cms.example.com"
                className="text-foreground underline-offset-4 hover:underline"
              >
                sales@capybara-cms.example.com
              </a>{" "}
              与我们联系。隐私相关事宜亦请参阅{" "}
              <Link
                href="/privacy"
                className="text-foreground underline-offset-4 hover:underline"
              >
                隐私政策
              </Link>
              。
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
