import { NextRequest, NextResponse } from 'next/server';
import { gemini } from '@/lib/gemini';
import { requireSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  await requireSession();
  const { companyName } = await req.json();
  if (!companyName) return NextResponse.json({ error: 'companyName required' }, { status: 400 });

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `You are a freight brokerage research assistant. Given the company name "${companyName}", provide a brief summary of what you know about this company in the context of freight/logistics. Include estimated info about: what they ship (commodities), equipment types likely needed, geography/regions they operate in, estimated shipping volume, and any other relevant logistics info. If you can't find specific info, make reasonable guesses based on the company name and industry. Format as JSON with fields: commodityTypes (array), equipmentTypes (array), geography (array), weeklyTruckloadVolume (string like "10-20"), notes (string with general info).` }]
      }],
    });

    const text = response.text || '';
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        return NextResponse.json(data);
      } catch {
        return NextResponse.json({ notes: text });
      }
    }
    return NextResponse.json({ notes: text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
