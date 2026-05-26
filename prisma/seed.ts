import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充示例数据...');

  // 清除现有数据
  await prisma.notification.deleteMany();
  await prisma.wardrobeItem.deleteMany();
  await prisma.wish.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.periodRecord.deleteMany();
  await prisma.weatherRecord.deleteMany();
  await prisma.diary.deleteMany();
  await prisma.importantDate.deleteMany();
  await prisma.couple.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('123456', 12);

  // 创建歪宝用户
  const waibao = await prisma.user.create({
    data: {
      email: 'waibao@test.com',
      password,
      nickname: '小歪宝',
      role: 'waibao',
      birthday: new Date('2000-08-08'),
      gender: 'female',
      mbti: 'INFP',
      loveNickname: '宝宝',
      comfortStyle: '抱抱和温柔的话',
      dislikeStyle: '大声说话',
      avatar: null,
    },
  });

  // 创建男朋友用户
  const partner = await prisma.user.create({
    data: {
      email: 'partner@test.com',
      password,
      nickname: '大熊',
      role: 'partner',
      birthday: new Date('1998-03-15'),
      gender: 'male',
      avatar: null,
    },
  });

  // 创建情侣绑定
  const couple = await prisma.couple.create({
    data: {
      userAId: waibao.id,
      userBId: partner.id,
      bindCode: 'WYTEST01',
      loveStartDate: new Date('2025-01-01'),
      status: 'active',
    },
  });

  // 创建重要日期
  await prisma.importantDate.createMany({
    data: [
      {
        userId: waibao.id,
        coupleId: couple.id,
        title: '歪宝生日',
        date: new Date('2026-08-08'),
        repeatType: 'yearly',
        remindDaysBefore: 7,
        showOnHome: true,
        notifyPartner: true,
        category: 'birthday',
      },
      {
        userId: waibao.id,
        coupleId: couple.id,
        title: '恋爱纪念日',
        date: new Date('2026-01-01'),
        repeatType: 'yearly',
        remindDaysBefore: 3,
        showOnHome: true,
        notifyPartner: true,
        category: 'anniversary',
      },
      {
        userId: waibao.id,
        title: '面试',
        date: addDays(new Date(), 14),
        repeatType: 'none',
        remindDaysBefore: 1,
        showOnHome: true,
        notifyPartner: false,
        category: 'interview',
      },
    ],
  });

  // 创建日记
  const today = new Date();
  await prisma.diary.createMany({
    data: [
      {
        userId: waibao.id,
        date: subDays(today, 2),
        content: '今天工作好忙，但是收到了他送的奶茶，超级开心！感觉所有的疲惫都消失了。希望每天都能这么甜～',
        moodScore: 4,
        aiComfortText: '收到心爱的人送的奶茶，这种被惦记的感觉真的很幸福呢。你的快乐也感染了我，愿你每天都能这样甜甜的！',
        emotionLevel: 0,
        emotionType: '开心',
        notifyPartner: false,
      },
      {
        userId: waibao.id,
        date: subDays(today, 1),
        content: '今天有点不开心…和同事闹了点矛盾，觉得自己处理得不够好。晚上回到家一个人偷偷哭了。他最近也很忙，不想让他担心。',
        moodScore: 2,
        aiComfortText: '没关系的，每个人都有处理得不够完美的时候。你已经做得很好了，不要对自己太苛刻。难过的时候允许自己哭一哭，然后明天又是新的一天。如果觉得需要，可以和他聊聊，真正关心你的人不会觉得这是负担。',
        emotionLevel: 3,
        emotionType: '委屈',
        notifyPartner: true,
      },
    ],
  });

  // 创建待办
  await prisma.todo.createMany({
    data: [
      {
        userId: waibao.id,
        title: '喝水 8 杯',
        description: '今天要记得多喝水',
        priority: 'medium',
        category: 'health',
        dueDate: today,
      },
      {
        userId: waibao.id,
        title: '交周报',
        description: '周五前提交',
        priority: 'high',
        category: 'work',
        dueDate: addDays(today, 3),
      },
      {
        userId: waibao.id,
        title: '晚上早点休息',
        description: '11点前睡觉',
        priority: 'medium',
        category: 'health',
        dueDate: today,
      },
      {
        userId: waibao.id,
        title: '和男朋友视频',
        priority: 'low',
        category: 'date',
      },
    ],
  });

  // 创建心愿
  await prisma.wish.createMany({
    data: [
      {
        userId: waibao.id,
        coupleId: couple.id,
        title: '想去海边',
        description: '想穿漂亮的小裙子在海边拍照，看日落🌅',
        category: 'travel',
        priority: 'high',
        progress: 30,
        status: 'claimed',
        claimedById: partner.id,
      },
      {
        userId: waibao.id,
        coupleId: couple.id,
        title: '吃火锅',
        description: '冬天最想和他一起吃火锅啦！',
        category: 'food',
        priority: 'medium',
        progress: 0,
        status: 'wanting',
      },
      {
        userId: waibao.id,
        title: '买新包包',
        description: '想要一个白色的帆布包',
        category: 'buy',
        priority: 'low',
        progress: 0,
        status: 'wanting',
      },
    ],
  });

  // 创建经期记录
  await prisma.periodRecord.createMany({
    data: [
      {
        userId: waibao.id,
        startDate: subDays(today, 28),
        endDate: subDays(today, 24),
        painLevel: 'moderate',
        mood: 'irritable',
        flowLevel: 'normal',
      },
      {
        userId: waibao.id,
        startDate: subDays(today, 56),
        endDate: subDays(today, 52),
        painLevel: 'mild',
        mood: 'sad',
        flowLevel: 'light',
      },
    ],
  });

  console.log('✅ 示例数据填充完成！');
  console.log('');
  console.log('📧 测试账号:');
  console.log('   歪宝: waibao@test.com / 123456');
  console.log('   男朋友: partner@test.com / 123456');
  console.log('   邀请码: WYTEST01');
}

main()
  .catch((e) => {
    console.error('❌ 填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
