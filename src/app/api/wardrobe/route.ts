import { NextRequest } from 'next/server';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import sharp from 'sharp';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'wardrobe');

function extFromType(type: string): string {
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  return 'jpg';
}

function publicUrl(fileName: string): string {
  return `/uploads/wardrobe/${fileName}`;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const items = await prisma.wardrobeItem.findMany({
      where: {
        userId: authUser.userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ items });
  } catch (error) {
    console.error('Wardrobe list error:', error);
    return errorResponse('获取衣橱失败', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return errorResponse('请上传衣服图片');
    }

    const type = String(formData.get('type') || 'top');
    const color = String(formData.get('color') || '') || null;
    const style = String(formData.get('style') || '') || null;
    const season = String(formData.get('season') || '') || null;
    const name = String(formData.get('name') || file.name || '') || null;

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extFromType(file.type || file.name);
    const baseName = `${authUser.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const originalName = `${baseName}.${ext}`;
    const whiteName = `${baseName}-white.jpg`;

    await writeFile(path.join(uploadDir, originalName), buffer);

    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 900;
    const height = metadata.height || 900;
    const size = Math.max(width, height, 900);

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: '#ffffff',
      },
    })
      .composite([
        {
          input: await sharp(buffer)
            .resize({
              width: Math.round(size * 0.86),
              height: Math.round(size * 0.86),
              fit: 'inside',
              withoutEnlargement: true,
            })
            .png()
            .toBuffer(),
          gravity: 'center',
        },
      ])
      .jpeg({ quality: 92 })
      .toFile(path.join(uploadDir, whiteName));

    const item = await prisma.wardrobeItem.create({
      data: {
        userId: authUser.userId,
        imageUrl: publicUrl(originalName),
        whiteImageUrl: publicUrl(whiteName),
        name,
        type,
        color,
        style,
        season,
      },
    });

    return successResponse({ item }, 201);
  } catch (error) {
    console.error('Wardrobe upload error:', error);
    return errorResponse('上传衣服失败', 500);
  }
}
