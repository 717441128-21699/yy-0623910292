import { format, subDays, parseISO, isAfter, isBefore, differenceInDays } from 'date-fns'
import type { Appeal, ClueGroup, Assignment, AlertItem, TrendPoint, Category } from '@/types'

export const baseToday = new Date()

export function d(daysAgo: number): string {
  return format(subDays(baseToday, daysAgo), 'yyyy-MM-dd')
}

export const appeals: Appeal[] = [
  { id: 'a1', source: 'hotline', category: '供水供电', content: '长安街道阳光花园小区已经停水三天了，居民用水极其困难，多次拨打自来水公司电话无人处理', location: '阳光花园小区', street: '长安街道', community: '阳光花园', createdAt: d(1), clueGroupId: 'cg1' },
  { id: 'a2', source: 'governance', category: '供水供电', content: '阳光花园小区停水问题严重，已经影响居民正常生活，希望有关部门尽快处理', location: '阳光花园小区', street: '长安街道', community: '阳光花园', createdAt: d(2), clueGroupId: 'cg1' },
  { id: 'a3', source: 'forum', category: '供水供电', content: '有没有阳光花园的邻居？我们这边又停水了，这都第几回了？', location: '阳光花园小区', street: '长安街道', community: '阳光花园', createdAt: d(2), clueGroupId: 'cg1' },
  { id: 'a4', source: 'hotline', category: '供水供电', content: '永安街道翠湖苑频繁停电，一周内已停电四次，冰箱食物全部变质', location: '翠湖苑小区', street: '永安街道', community: '翠湖苑', createdAt: d(0), clueGroupId: 'cg2' },
  { id: 'a5', source: 'forum', category: '供水供电', content: '翠湖苑又双叒停电了，供电公司到底管不管？', location: '翠湖苑小区', street: '永安街道', community: '翠湖苑', createdAt: d(1), clueGroupId: 'cg2' },
  { id: 'a6', source: 'governance', category: '供水供电', content: '翠湖苑小区供电线路老化，频繁停电严重影响老人和小孩生活', location: '翠湖苑小区', street: '永安街道', community: '翠湖苑', createdAt: d(0), clueGroupId: 'cg2' },
  { id: 'a7', source: 'hotline', category: '供水供电', content: '新华街道金桥家园水压不足，高层住户无法正常用水', location: '金桥家园', street: '新华街道', community: '金桥家园', createdAt: d(3), clueGroupId: 'cg3' },
  { id: 'a8', source: 'governance', category: '供水供电', content: '金桥家园高层水压问题反映多次仍未解决', location: '金桥家园', street: '新华街道', community: '金桥家园', createdAt: d(4), clueGroupId: 'cg3' },
  { id: 'a9', source: 'hotline', category: '道路出行', content: '朝阳街道人民路大坑已经造成多起交通事故，路面严重破损', location: '人民路', street: '朝阳街道', createdAt: d(1), clueGroupId: 'cg4' },
  { id: 'a10', source: 'forum', category: '道路出行', content: '人民路那个大坑真的太危险了，昨晚又有人骑电动车摔了', location: '人民路', street: '朝阳街道', createdAt: d(1), clueGroupId: 'cg4' },
  { id: 'a11', source: 'governance', category: '道路出行', content: '朝阳街道人民路路面破损严重，存在交通安全隐患，请尽快维修', location: '人民路', street: '朝阳街道', createdAt: d(2), clueGroupId: 'cg4' },
  { id: 'a12', source: 'hotline', category: '道路出行', content: '东城街道建设路下水道井盖缺失，已有行人差点掉入', location: '建设路', street: '东城街道', createdAt: d(0), clueGroupId: 'cg5' },
  { id: 'a13', source: 'governance', category: '道路出行', content: '建设路多处井盖损坏缺失，希望尽快更换', location: '建设路', street: '东城街道', createdAt: d(1), clueGroupId: 'cg5' },
  { id: 'a14', source: 'hotline', category: '道路出行', content: '西关街道兴华路红绿灯已经坏了半个月了，交通混乱', location: '兴华路', street: '西关街道', createdAt: d(2), clueGroupId: 'cg6' },
  { id: 'a15', source: 'forum', category: '道路出行', content: '兴华路红绿灯不亮，每天早高峰堵得水泄不通', location: '兴华路', street: '西关街道', createdAt: d(3), clueGroupId: 'cg6' },
  { id: 'a16', source: 'hotline', category: '物业纠纷', content: '长安街道锦绣园物业费涨了30%但服务质量严重下降，垃圾三天才清一次', location: '锦绣园小区', street: '长安街道', community: '锦绣园', createdAt: d(0), clueGroupId: 'cg7' },
  { id: 'a17', source: 'governance', category: '物业纠纷', content: '锦绣园小区物业擅自涨价且不公示账目，业主要求审计', location: '锦绣园小区', street: '长安街道', community: '锦绣园', createdAt: d(1), clueGroupId: 'cg7' },
  { id: 'a18', source: 'forum', category: '物业纠纷', content: '锦绣园的物业简直了，收费第一服务倒数', location: '锦绣园小区', street: '长安街道', community: '锦绣园', createdAt: d(0), clueGroupId: 'cg7' },
  { id: 'a19', source: 'hotline', category: '物业纠纷', content: '永安街道碧水湾小区电梯故障频发，老人被困多次', location: '碧水湾小区', street: '永安街道', community: '碧水湾', createdAt: d(2), clueGroupId: 'cg8' },
  { id: 'a20', source: 'governance', category: '物业纠纷', content: '碧水湾3号楼电梯反复故障，物业推诿不维修', location: '碧水湾小区', street: '永安街道', community: '碧水湾', createdAt: d(3), clueGroupId: 'cg8' },
  { id: 'a21', source: 'forum', category: '物业纠纷', content: '碧水湾电梯又坏了，我妈差点被困在里面', location: '碧水湾小区', street: '永安街道', community: '碧水湾', createdAt: d(2), clueGroupId: 'cg8' },
  { id: 'a22', source: 'hotline', category: '物业纠纷', content: '新华街道和平里小区消防通道被私家车长期占用', location: '和平里小区', street: '新华街道', community: '和平里', createdAt: d(4), clueGroupId: 'cg9' },
  { id: 'a23', source: 'governance', category: '物业纠纷', content: '和平里消防通道堵塞问题反映多次，物业不作为', location: '和平里小区', street: '新华街道', community: '和平里', createdAt: d(5), clueGroupId: 'cg9' },
  { id: 'a24', source: 'hotline', category: '教育医疗', content: '朝阳街道实验小学班级人数超60人，教学质量严重下降', location: '实验小学', street: '朝阳街道', createdAt: d(1), clueGroupId: 'cg10' },
  { id: 'a25', source: 'governance', category: '教育医疗', content: '朝阳街道实验小学大班额问题突出，家长强烈要求增班', location: '实验小学', street: '朝阳街道', createdAt: d(2), clueGroupId: 'cg10' },
  { id: 'a26', source: 'forum', category: '教育医疗', content: '实验小学一个班60多个孩子，老师根本管不过来', location: '实验小学', street: '朝阳街道', createdAt: d(1), clueGroupId: 'cg10' },
  { id: 'a27', source: 'hotline', category: '教育医疗', content: '东城街道社区卫生服务中心设备老旧，无法做基本检查', location: '东城社区卫生服务中心', street: '东城街道', createdAt: d(3), clueGroupId: 'cg11' },
  { id: 'a28', source: 'governance', category: '教育医疗', content: '东城社区卫生中心缺乏基本检查设备，居民看病需跑远路', location: '东城社区卫生服务中心', street: '东城街道', createdAt: d(4), clueGroupId: 'cg11' },
  { id: 'a29', source: 'hotline', category: '教育医疗', content: '西关街道幼儿园严重不足，适龄儿童入园困难', location: '西关街道', street: '西关街道', createdAt: d(5), clueGroupId: 'cg12' },
  { id: 'a30', source: 'governance', category: '教育医疗', content: '西关街道公办幼儿园名额紧缺，建议增加学前教育资源', location: '西关街道', street: '西关街道', createdAt: d(6), clueGroupId: 'cg12' },
  { id: 'a31', source: 'forum', category: '教育医疗', content: '西关这边的家长都在抢幼儿园名额，太难了', location: '西关街道', street: '西关街道', createdAt: d(5), clueGroupId: 'cg12' },
  { id: 'a32', source: 'hotline', category: '其他', content: '长安街道夜市摊贩占道经营影响居民休息', location: '长安街道夜市', street: '长安街道', createdAt: d(0), clueGroupId: 'cg13' },
  { id: 'a33', source: 'governance', category: '其他', content: '长安街道夜市噪音扰民问题严重，多次投诉无果', location: '长安街道夜市', street: '长安街道', createdAt: d(1), clueGroupId: 'cg13' },
  { id: 'a34', source: 'forum', category: '其他', content: '长安夜市每天吵到凌晨两点，明天还要上班啊', location: '长安街道夜市', street: '长安街道', createdAt: d(0), clueGroupId: 'cg13' },
  { id: 'a35', source: 'hotline', category: '供水供电', content: '朝阳街道华府天地自来水浑浊发黄，不敢饮用', location: '华府天地小区', street: '朝阳街道', community: '华府天地', createdAt: d(1), clueGroupId: 'cg14' },
  { id: 'a36', source: 'governance', category: '供水供电', content: '华府天地小区自来水水质异常，要求检测', location: '华府天地小区', street: '朝阳街道', community: '华府天地', createdAt: d(2), clueGroupId: 'cg14' },
  { id: 'a37', source: 'hotline', category: '道路出行', content: '永安街道文化路人行道被商铺货物占用，行人只能走机动车道', location: '文化路', street: '永安街道', createdAt: d(3), clueGroupId: 'cg15' },
  { id: 'a38', source: 'governance', category: '道路出行', content: '文化路占道经营问题严重，影响行人安全', location: '文化路', street: '永安街道', createdAt: d(4), clueGroupId: 'cg15' },
  { id: 'a39', source: 'forum', category: '道路出行', content: '文化路的人行道简直变成了仓库', location: '文化路', street: '永安街道', createdAt: d(3), clueGroupId: 'cg15' },
  { id: 'a40', source: 'hotline', category: '物业纠纷', content: '朝阳街道金辉小区地下车库长期积水，车辆泡水', location: '金辉小区', street: '朝阳街道', community: '金辉', createdAt: d(2), clueGroupId: 'cg16' },
  { id: 'a41', source: 'governance', category: '物业纠纷', content: '金辉小区地下车库渗水问题反映半年未解决', location: '金辉小区', street: '朝阳街道', community: '金辉', createdAt: d(3), clueGroupId: 'cg16' },
  { id: 'a42', source: 'hotline', category: '其他', content: '新华街道流浪狗聚集，咬伤多名儿童', location: '新华街道', street: '新华街道', createdAt: d(0), clueGroupId: 'cg17' },
  { id: 'a43', source: 'forum', category: '其他', content: '新华街道这边流浪狗越来越多了，小孩都不敢在外面玩', location: '新华街道', street: '新华街道', createdAt: d(0), clueGroupId: 'cg17' },
  { id: 'a44', source: 'governance', category: '其他', content: '新华街道流浪犬管理缺位，建议组织收容', location: '新华街道', street: '新华街道', createdAt: d(1), clueGroupId: 'cg17' },
  { id: 'a45', source: 'hotline', category: '供水供电', content: '东城街道幸福里供暖不达标，室内温度仅14度', location: '幸福里小区', street: '东城街道', community: '幸福里', createdAt: d(5), clueGroupId: 'cg18' },
  { id: 'a46', source: 'governance', category: '供水供电', content: '幸福里供暖温度不达标，居民反映强烈', location: '幸福里小区', street: '东城街道', community: '幸福里', createdAt: d(6), clueGroupId: 'cg18' },
  { id: 'a47', source: 'forum', category: '供水供电', content: '幸福里的暖气就跟没有一样，在家还得穿棉袄', location: '幸福里小区', street: '东城街道', community: '幸福里', createdAt: d(5), clueGroupId: 'cg18' },
  { id: 'a48', source: 'hotline', category: '道路出行', content: '长安街道学府路路灯大面积不亮，夜间出行危险', location: '学府路', street: '长安街道', createdAt: d(2), clueGroupId: 'cg19' },
  { id: 'a49', source: 'governance', category: '道路出行', content: '学府路路灯损坏严重，存在治安隐患', location: '学府路', street: '长安街道', createdAt: d(3), clueGroupId: 'cg19' },
  { id: 'a50', source: 'hotline', category: '教育医疗', content: '永安街道中学食堂卫生条件差，多名学生出现腹泻', location: '永安中学', street: '永安街道', createdAt: d(0), clueGroupId: 'cg20' },
  { id: 'a51', source: 'governance', category: '教育医疗', content: '永安中学食堂卫生问题突出，家长要求整改', location: '永安中学', street: '永安街道', createdAt: d(1), clueGroupId: 'cg20' },
  { id: 'a52', source: 'forum', category: '教育医疗', content: '永安中学食堂这也太差了吧，孩子拉肚子了', location: '永安中学', street: '永安街道', createdAt: d(0), clueGroupId: 'cg20' },
  { id: 'a53', source: 'hotline', category: '物业纠纷', content: '东城街道阳光城小区绿化被铲除建车位', location: '阳光城小区', street: '东城街道', community: '阳光城', createdAt: d(4), clueGroupId: 'cg21' },
  { id: 'a54', source: 'governance', category: '物业纠纷', content: '阳光城小区未经业主同意铲除绿化改建车位', location: '阳光城小区', street: '东城街道', community: '阳光城', createdAt: d(5), clueGroupId: 'cg21' },
  { id: 'a55', source: 'forum', category: '物业纠纷', content: '阳光城绿化没了变成车位，物业太过分了', location: '阳光城小区', street: '东城街道', community: '阳光城', createdAt: d(4), clueGroupId: 'cg21' },
  { id: 'a56', source: 'hotline', category: '供水供电', content: '西关街道龙腾小区燃气管道老化漏气，存在安全隐患', location: '龙腾小区', street: '西关街道', community: '龙腾', createdAt: d(3), clueGroupId: 'cg22' },
  { id: 'a57', source: 'governance', category: '供水供电', content: '龙腾小区燃气管道年久失修，亟需更换', location: '龙腾小区', street: '西关街道', community: '龙腾', createdAt: d(4), clueGroupId: 'cg22' },
  { id: 'a58', source: 'hotline', category: '其他', content: '永安街道广场舞噪音扰民，每天早上六点准时开始', location: '永安街道广场', street: '永安街道', createdAt: d(1), clueGroupId: 'cg23' },
  { id: 'a59', source: 'forum', category: '其他', content: '永安广场舞大妈能不能晚点开始？六点太早了吧', location: '永安街道广场', street: '永安街道', createdAt: d(1), clueGroupId: 'cg23' },
  { id: 'a60', source: 'governance', category: '其他', content: '永安街道广场舞噪音问题需规范管理', location: '永安街道广场', street: '永安街道', createdAt: d(2), clueGroupId: 'cg23' },
]

export const baseClueGroups: ClueGroup[] = [
  { id: 'cg1', category: '供水供电', appeals: appeals.filter(a => a.clueGroupId === 'cg1'), summary: '阳光花园小区停水三天，居民用水困难', firstSeenAt: d(2), locations: ['阳光花园小区'], isAssigned: true, assignment: { id: 'as1', clueGroupId: 'cg1', department: '水务局', deadline: d(-1), note: '已通知水务局紧急处理，需协调供水管网维修', status: 'overdue', createdAt: d(1) } },
  { id: 'cg2', category: '供水供电', appeals: appeals.filter(a => a.clueGroupId === 'cg2'), summary: '翠湖苑频繁停电，供电线路老化', firstSeenAt: d(1), locations: ['翠湖苑小区'], isAssigned: true, assignment: { id: 'as2', clueGroupId: 'cg2', department: '供电公司', deadline: d(1), note: '需更换变压器及部分线路', status: 'urgent', createdAt: d(0) } },
  { id: 'cg3', category: '供水供电', appeals: appeals.filter(a => a.clueGroupId === 'cg3'), summary: '金桥家园高层水压不足', firstSeenAt: d(4), locations: ['金桥家园'], isAssigned: true, assignment: { id: 'as3', clueGroupId: 'cg3', department: '水务局', deadline: d(-3), note: '二次供水设备需维修', status: 'overdue', createdAt: d(3) } },
  { id: 'cg4', category: '道路出行', appeals: appeals.filter(a => a.clueGroupId === 'cg4'), summary: '人民路路面严重破损，已致多起事故', firstSeenAt: d(2), locations: ['人民路'], isAssigned: true, assignment: { id: 'as4', clueGroupId: 'cg4', department: '交通局', deadline: d(2), note: '已报交通局安排道路维修', status: 'urgent', createdAt: d(1) } },
  { id: 'cg5', category: '道路出行', appeals: appeals.filter(a => a.clueGroupId === 'cg5'), summary: '建设路井盖缺失，行人安全受威胁', firstSeenAt: d(1), locations: ['建设路'], isAssigned: false },
  { id: 'cg6', category: '道路出行', appeals: appeals.filter(a => a.clueGroupId === 'cg6'), summary: '兴华路红绿灯故障半月未修', firstSeenAt: d(3), locations: ['兴华路'], isAssigned: true, assignment: { id: 'as5', clueGroupId: 'cg6', department: '交通局', deadline: d(-2), note: '信号灯设备需更换', status: 'overdue', createdAt: d(2) } },
  { id: 'cg7', category: '物业纠纷', appeals: appeals.filter(a => a.clueGroupId === 'cg7'), summary: '锦绣园物业费涨价30%服务下降', firstSeenAt: d(1), locations: ['锦绣园小区'], isAssigned: true, assignment: { id: 'as6', clueGroupId: 'cg7', department: '物业办', deadline: d(3), note: '需核实物业费调整程序是否合规', status: 'urgent', createdAt: d(0) } },
  { id: 'cg8', category: '物业纠纷', appeals: appeals.filter(a => a.clueGroupId === 'cg8'), summary: '碧水湾电梯故障频发，老人被困', firstSeenAt: d(3), locations: ['碧水湾小区'], isAssigned: true, assignment: { id: 'as7', clueGroupId: 'cg8', department: '住建局', deadline: d(0), note: '电梯年检过期，需强制检修', status: 'done', createdAt: d(2), feedbackAt: d(0) } },
  { id: 'cg9', category: '物业纠纷', appeals: appeals.filter(a => a.clueGroupId === 'cg9'), summary: '和平里消防通道被私家车占用', firstSeenAt: d(5), locations: ['和平里小区'], isAssigned: false },
  { id: 'cg10', category: '教育医疗', appeals: appeals.filter(a => a.clueGroupId === 'cg10'), summary: '实验小学大班额问题突出', firstSeenAt: d(2), locations: ['实验小学'], isAssigned: true, assignment: { id: 'as8', clueGroupId: 'cg10', department: '教育局', deadline: d(5), note: '教育局正在调研增班方案', status: 'urgent', createdAt: d(1) } },
  { id: 'cg11', category: '教育医疗', appeals: appeals.filter(a => a.clueGroupId === 'cg11'), summary: '东城社区卫生中心设备老旧', firstSeenAt: d(4), locations: ['东城社区卫生服务中心'], isAssigned: false },
  { id: 'cg12', category: '教育医疗', appeals: appeals.filter(a => a.clueGroupId === 'cg12'), summary: '西关街道幼儿园名额严重不足', firstSeenAt: d(6), locations: ['西关街道'], isAssigned: true, assignment: { id: 'as9', clueGroupId: 'cg12', department: '教育局', deadline: d(-4), note: '需协调增设公办幼儿园', status: 'overdue', createdAt: d(5) } },
  { id: 'cg13', category: '其他', appeals: appeals.filter(a => a.clueGroupId === 'cg13'), summary: '长安街道夜市噪音扰民', firstSeenAt: d(1), locations: ['长安街道夜市'], isAssigned: true, assignment: { id: 'as10', clueGroupId: 'cg13', department: '城管局', deadline: d(4), note: '已约谈夜市管理方，要求限时经营', status: 'urgent', createdAt: d(0) } },
  { id: 'cg14', category: '供水供电', appeals: appeals.filter(a => a.clueGroupId === 'cg14'), summary: '华府天地自来水浑浊发黄', firstSeenAt: d(2), locations: ['华府天地小区'], isAssigned: false },
  { id: 'cg15', category: '道路出行', appeals: appeals.filter(a => a.clueGroupId === 'cg15'), summary: '文化路人行道被商铺占用', firstSeenAt: d(4), locations: ['文化路'], isAssigned: true, assignment: { id: 'as11', clueGroupId: 'cg15', department: '城管局', deadline: d(-1), note: '已下发整改通知', status: 'done', createdAt: d(3), feedbackAt: d(-1) } },
  { id: 'cg16', category: '物业纠纷', appeals: appeals.filter(a => a.clueGroupId === 'cg16'), summary: '金辉小区地下车库长期积水', firstSeenAt: d(3), locations: ['金辉小区'], isAssigned: false },
  { id: 'cg17', category: '其他', appeals: appeals.filter(a => a.clueGroupId === 'cg17'), summary: '新华街道流浪狗聚集伤人', firstSeenAt: d(1), locations: ['新华街道'], isAssigned: false },
  { id: 'cg18', category: '供水供电', appeals: appeals.filter(a => a.clueGroupId === 'cg18'), summary: '幸福里供暖不达标', firstSeenAt: d(6), locations: ['幸福里小区'], isAssigned: true, assignment: { id: 'as12', clueGroupId: 'cg18', department: '住建局', deadline: d(0), note: '供暖企业已承诺加压检修', status: 'done', createdAt: d(5), feedbackAt: d(0) } },
  { id: 'cg19', category: '道路出行', appeals: appeals.filter(a => a.clueGroupId === 'cg19'), summary: '学府路路灯大面积不亮', firstSeenAt: d(3), locations: ['学府路'], isAssigned: false },
  { id: 'cg20', category: '教育医疗', appeals: appeals.filter(a => a.clueGroupId === 'cg20'), summary: '永安中学食堂卫生条件差', firstSeenAt: d(1), locations: ['永安中学'], isAssigned: true, assignment: { id: 'as13', clueGroupId: 'cg20', department: '卫健委', deadline: d(1), note: '已联合卫健开展检查', status: 'urgent', createdAt: d(0) } },
  { id: 'cg21', category: '物业纠纷', appeals: appeals.filter(a => a.clueGroupId === 'cg21'), summary: '阳光城铲除绿化改建车位', firstSeenAt: d(5), locations: ['阳光城小区'], isAssigned: false },
  { id: 'cg22', category: '供水供电', appeals: appeals.filter(a => a.clueGroupId === 'cg22'), summary: '龙腾小区燃气管道老化漏气', firstSeenAt: d(4), locations: ['龙腾小区'], isAssigned: true, assignment: { id: 'as14', clueGroupId: 'cg22', department: '住建局', deadline: d(-2), note: '安全隐患紧急处置', status: 'overdue', createdAt: d(3) } },
  { id: 'cg23', category: '其他', appeals: appeals.filter(a => a.clueGroupId === 'cg23'), summary: '永安街道广场舞噪音扰民', firstSeenAt: d(2), locations: ['永安街道广场'], isAssigned: false },
]

export function computeAssignmentStatus(deadline: string, isDone: boolean, feedbackAt?: string): 'overdue' | 'urgent' | 'done' {
  if (isDone || feedbackAt) return 'done'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = parseISO(deadline)
  deadlineDate.setHours(0, 0, 0, 0)
  const diff = differenceInDays(deadlineDate, today)
  if (diff < 0) return 'overdue'
  if (diff <= 3) return 'urgent'
  return 'urgent'
}

export function getFilteredAppeals(
  allAppeals: Appeal[],
  selectedStreets: string[],
  selectedCategories: string[],
  timeRange: '7d' | '30d' | 'custom'
): Appeal[] {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const daysBack = timeRange === '7d' ? 7 : 30
  const startDate = subDays(today, daysBack)
  startDate.setHours(0, 0, 0, 0)

  return allAppeals.filter((a) => {
    if (selectedStreets.length > 0 && !selectedStreets.includes(a.street)) return false
    if (selectedCategories.length > 0 && !selectedCategories.includes(a.category)) return false
    const createdAt = parseISO(a.createdAt)
    if (isBefore(createdAt, startDate) || isAfter(createdAt, today)) return false
    return true
  })
}

export function getFilteredCategoryStats(
  filteredAppeals: Appeal[],
  allAppeals: Appeal[],
  selectedStreets: string[],
  selectedCategories: string[],
  timeRange: '7d' | '30d' | 'custom'
): { category: Category; count: number; change: number }[] {
  const categories: Category[] = ['供水供电', '道路出行', '物业纠纷', '教育医疗', '其他']
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const daysBack = timeRange === '7d' ? 7 : 30
  const currentStart = subDays(today, daysBack)
  const prevEnd = subDays(currentStart, 1)
  const prevStart = subDays(prevEnd, daysBack)
  currentStart.setHours(0, 0, 0, 0)
  prevEnd.setHours(23, 59, 59, 999)
  prevStart.setHours(0, 0, 0, 0)

  return categories.map((cat) => {
    const currentCount = filteredAppeals.filter((a) => a.category === cat).length
    const prevCount = allAppeals.filter((a) => {
      if (selectedStreets.length > 0 && !selectedStreets.includes(a.street)) return false
      if (selectedCategories.length > 0 && !selectedCategories.includes(a.category)) return false
      if (a.category !== cat) return false
      const createdAt = parseISO(a.createdAt)
      return !isBefore(createdAt, prevStart) && !isAfter(createdAt, prevEnd)
    }).length
    const change = prevCount === 0 ? 100 : Math.round(((currentCount - prevCount) / prevCount) * 100)
    return { category: cat, count: currentCount, change }
  })
}

export function getFilteredAlertItems(
  filteredAppeals: Appeal[],
  allAppeals: Appeal[],
  selectedStreets: string[],
  selectedCategories: string[],
  timeRange: '7d' | '30d' | 'custom'
): AlertItem[] {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const daysBack = timeRange === '7d' ? 7 : 30
  const currentStart = subDays(today, daysBack)
  const prevEnd = subDays(currentStart, 1)
  const prevStart = subDays(prevEnd, daysBack)
  currentStart.setHours(0, 0, 0, 0)
  prevEnd.setHours(23, 59, 59, 999)
  prevStart.setHours(0, 0, 0, 0)

  const locGroup = new Map<string, { appeals: Appeal[]; current: number; prev: number }>()

  for (const a of filteredAppeals) {
    const key = a.location
    if (!locGroup.has(key)) {
      locGroup.set(key, { appeals: [], current: 0, prev: 0 })
    }
    locGroup.get(key)!.appeals.push(a)
    locGroup.get(key)!.current += 1
  }

  for (const a of allAppeals) {
    if (selectedStreets.length > 0 && !selectedStreets.includes(a.street)) continue
    if (selectedCategories.length > 0 && !selectedCategories.includes(a.category)) continue
    const key = a.location
    if (!locGroup.has(key)) continue
    const createdAt = parseISO(a.createdAt)
    if (!isBefore(createdAt, prevStart) && !isAfter(createdAt, prevEnd)) {
      locGroup.get(key)!.prev += 1
    }
  }

  const alerts: AlertItem[] = []
  let id = 0
  for (const [location, data] of locGroup.entries()) {
    const { current, prev, appeals } = data
    const increase = prev === 0 ? 100 : Math.round(((current - prev) / prev) * 100)
    if (increase >= 50 && current >= 2 && appeals.length > 0) {
      alerts.push({
        id: `al_${id++}`,
        location,
        street: appeals[0].street,
        category: appeals[0].category,
        increase,
        currentCount: current,
      })
    }
  }

  return alerts.sort((a, b) => b.increase - a.increase)
}

export function getFilteredTrendData(
  allAppeals: Appeal[],
  selectedStreets: string[],
  selectedCategories: string[],
  timeRange: '7d' | '30d' | 'custom'
): TrendPoint[] {
  const categories: Category[] = ['供水供电', '道路出行', '物业纠纷', '教育医疗', '其他']
  const days = timeRange === '7d' ? 7 : 30
  const data: TrendPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd')
    const point: TrendPoint = { date: dateStr } as TrendPoint
    for (const cat of categories) {
      point[cat] = allAppeals.filter((a) => {
        if (selectedStreets.length > 0 && !selectedStreets.includes(a.street)) return false
        if (selectedCategories.length > 0 && !selectedCategories.includes(a.category)) return false
        if (a.category !== cat) return false
        return a.createdAt === dateStr
      }).length
    }
    data.push(point)
  }
  return data
}

export function getFilteredStreetHeat(
  filteredAppeals: Appeal[],
  allStreets: string[]
): { street: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const s of allStreets) counts[s] = 0
  for (const a of filteredAppeals) {
    counts[a.street] = (counts[a.street] || 0) + 1
  }
  return Object.entries(counts).map(([street, count]) => ({ street, count }))
}

export function getFilteredClueGroups(
  clueGroups: ClueGroup[],
  selectedStreets: string[],
  selectedCategories: string[]
): ClueGroup[] {
  return clueGroups.filter((cg) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(cg.category)) return false
    if (selectedStreets.length > 0) {
      const hasMatchingStreet = cg.appeals.some((a) => selectedStreets.includes(a.street))
      if (!hasMatchingStreet) return false
    }
    return true
  })
}

export function getBaseClueGroups(): ClueGroup[] {
  return baseClueGroups
}

export function getBaseAssignments(): Assignment[] {
  return baseClueGroups.filter((cg) => cg.assignment).map((cg) => cg.assignment!)
}
