import { ContentSection } from '../components/content-section'
import { SettlementForm } from './settlement-form'

export default function SettlementPage() {
    return (
        <ContentSection
            title="结算设置"
            desc="配置订单收入的结算规则，包括冻结天数、提现限制等"
        >
            <SettlementForm />
        </ContentSection>
    )
}

