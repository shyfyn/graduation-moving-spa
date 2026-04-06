import { Link } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { EmptyState } from '../../components/common/EmptyState'

export const NotFoundPage = () => <EmptyState title="页面不存在" description="当前地址没有对应页面，返回首页继续使用。" action={<Link to="/dashboard"><AppButton>返回首页</AppButton></Link>} />
