import 'dotenv/config';
import { db } from './client';
import { activities, typeDefinitions } from './schema';
import { TYPE_DEFINITIONS } from '../types-data';
import { ACTIVITIES } from '../activities';

async function seed() {
  console.log('Seeding type_definitions...');
  for (const t of TYPE_DEFINITIONS) {
    await db
      .insert(typeDefinitions)
      .values({
        id: t.id,
        labelZh: t.labelZh,
        taglineZh: t.taglineZh,
        colorPri: t.colorPri,
        colorSec: t.colorSec,
        emoji: t.emoji,
      })
      .onConflictDoUpdate({
        target: typeDefinitions.id,
        set: {
          labelZh: t.labelZh,
          taglineZh: t.taglineZh,
          colorPri: t.colorPri,
          colorSec: t.colorSec,
          emoji: t.emoji,
        },
      });
  }
  console.log(`  ${TYPE_DEFINITIONS.length} types seeded`);

  console.log('Seeding activities...');
  for (const a of ACTIVITIES) {
    await db
      .insert(activities)
      .values({
        id: a.id,
        labelZh: a.labelZh,
        iconPath: a.iconPath,
        category: a.category,
      })
      .onConflictDoUpdate({
        target: activities.id,
        set: {
          labelZh: a.labelZh,
          iconPath: a.iconPath,
          category: a.category,
        },
      });
  }
  console.log(`  ${ACTIVITIES.length} activities seeded`);

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
