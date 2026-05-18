-- Seed the marquee AI labs.

insert into public.labs (slug, name, domain, logo_url, description, is_featured) values
  ('openai',     'OpenAI',     'openai.com',     'https://logo.clearbit.com/openai.com',     'Creator of GPT and ChatGPT.', true),
  ('anthropic',  'Anthropic',  'anthropic.com',  'https://logo.clearbit.com/anthropic.com',  'Creator of Claude. Safety-first AI lab.', true),
  ('deepmind',   'Google DeepMind', 'deepmind.com', 'https://logo.clearbit.com/deepmind.com', 'Google''s research lab. Gemini, AlphaFold.', true),
  ('meta-ai',    'Meta AI',    'ai.meta.com',    'https://logo.clearbit.com/meta.com',       'Llama, FAIR, Reality Labs.', true),
  ('xai',        'xAI',        'x.ai',           'https://logo.clearbit.com/x.ai',           'Elon Musk''s AI lab. Grok.', true),
  ('mistral',    'Mistral AI', 'mistral.ai',     'https://logo.clearbit.com/mistral.ai',     'Paris-based open-weight lab.', true),
  ('cohere',     'Cohere',     'cohere.com',     'https://logo.clearbit.com/cohere.com',     'Enterprise LLM platform.', true),
  ('inflection', 'Inflection AI', 'inflection.ai', 'https://logo.clearbit.com/inflection.ai', 'Personal AI / Pi.', false),
  ('adept',      'Adept',      'adept.ai',       'https://logo.clearbit.com/adept.ai',       'Action models for software.', false),
  ('character',  'Character.AI', 'character.ai', 'https://logo.clearbit.com/character.ai',   'Consumer character chat.', false),
  ('perplexity', 'Perplexity', 'perplexity.ai',  'https://logo.clearbit.com/perplexity.ai',  'Answer engine.', true),
  ('runway',     'Runway',     'runwayml.com',   'https://logo.clearbit.com/runwayml.com',   'Generative video.', false),
  ('hugging-face','Hugging Face','huggingface.co','https://logo.clearbit.com/huggingface.co','Open-source ML hub.', false),
  ('scale',      'Scale AI',   'scale.com',      'https://logo.clearbit.com/scale.com',      'AI data + RLHF infra.', false),
  ('groq',       'Groq',       'groq.com',       'https://logo.clearbit.com/groq.com',       'LPU inference platform.', false),
  ('together',   'Together AI', 'together.ai',   'https://logo.clearbit.com/together.ai',    'Open-model inference.', false),
  ('stability',  'Stability AI', 'stability.ai', 'https://logo.clearbit.com/stability.ai',   'Stable Diffusion.', false),
  ('midjourney', 'Midjourney', 'midjourney.com', 'https://logo.clearbit.com/midjourney.com', 'Image generation.', false),
  ('eleven',     'ElevenLabs', 'elevenlabs.io',  'https://logo.clearbit.com/elevenlabs.io',  'Voice generation.', false),
  ('suno',       'Suno',       'suno.com',       'https://logo.clearbit.com/suno.com',       'Music generation.', false)
on conflict (slug) do update set
  name = excluded.name,
  domain = excluded.domain,
  logo_url = excluded.logo_url,
  description = excluded.description,
  is_featured = excluded.is_featured;
