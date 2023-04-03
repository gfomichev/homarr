import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import {
  ActionIcon,
  Badge,
  Card,
  Center,
  createStyles,
  Flex,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  MediaQuery,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconBulldozer,
  IconCalendarTime,
  IconClock,
  IconCopyright,
  IconRefresh,
  IconRss,
  IconSpeakerphone,
} from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState } from 'react';

const definition = defineWidget({
  id: 'rss',
  icon: IconRss,
  options: {
    rssFeedUrl: {
      type: 'text',
      defaultValue: '',
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: RssTile,
});

export type IRssWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface RssTileProps {
  widget: IRssWidget;
}

export const useGetRssFeed = (feedUrl: string, widgetId: string) =>
  useQuery({
    queryKey: ['rss-feed', feedUrl],
    queryFn: async () => {
      const response = await fetch(`/api/modules/rss?widgetId=${widgetId}`);
      return response.json();
    },
  });

function RssTile({ widget }: RssTileProps) {
  const { t } = useTranslation('modules/rss');
  const { data, isLoading, isFetching, isError, refetch } = useGetRssFeed(
    widget.properties.rssFeedUrl,
    widget.id
  );
  const { classes } = useStyles();
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false);

  function formatDate(input: string): string {
    // Parse the input date as a local date
    const inputDate = dayjs(new Date(input));
    const now = dayjs(); // Current date and time

    // The difference between the input date and now
    const difference = now.diff(inputDate, 'ms');
    const duration = dayjs.duration(difference, 'ms');
    const humanizedDuration = duration.humanize();
    return `${humanizedDuration} ago`;
  }

  if (!data || isLoading) {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    );
  }

  if (!data.success || isError) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconRss size={40} strokeWidth={1} />
          <Title order={6}>{t('card.errors.general.title')}</Title>
          <Text align="center">{t('card.errors.general.text')}</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack h="100%">
      <LoadingOverlay visible={isFetching} />
      <Flex align="end">{data.feed.title && <Title order={5}>{data.feed.title}</Title>}</Flex>
      <ScrollArea className="scroll-area-w100" w="100%">
        <Stack w="100%" spacing="xs">
          {data.feed.items.map((item: any, index: number) => (
            <Card
              key={index}
              withBorder
              component={Link ?? 'div'}
              href={item.link}
              radius="md"
              target="_blank"
              w="100%"
            >
              {item.enclosure && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={classes.backgroundImage}
                  src={item.enclosure.url ?? undefined}
                  alt="backdrop"
                />
              )}

              <Flex gap="xs">
                {item.enclosure && (
                  <MediaQuery query="(max-width: 1200px)" styles={{ display: 'none' }}>
                    <Image
                      src={item.enclosure?.url ?? undefined}
                      width={140}
                      height={140}
                      radius="md"
                      withPlaceholder
                    />
                  </MediaQuery>
                )}
                <Flex gap={2} direction="column" w="100%">
                  {item.categories && (
                    <Flex gap="xs" wrap="wrap" h={20} style={{ overflow: 'hidden' }}>
                      {item.categories.map((category: any, categoryIndex: number) => (
                        <Badge key={categoryIndex}>{category}</Badge>
                      ))}
                    </Flex>
                  )}

                  <Text lineClamp={2}>{item.title}</Text>
                  <Text color="dimmed" size="xs" lineClamp={3}>
                    {item.content}
                  </Text>

                  {item.pubDate && <TimeDisplay date={formatDate(item.pubDate)} />}
                </Flex>
              </Flex>
            </Card>
          ))}
        </Stack>
      </ScrollArea>

      <Flex wrap="wrap" columnGap="md">
        {data.feed.copyright && (
          <Group spacing="sm">
            <IconCopyright size={14} />
            <Text color="dimmed" size="sm">
              {data.feed.copyright}
            </Text>
          </Group>
        )}
        {data.feed.pubDate && (
          <Group>
            <IconCalendarTime size={14} />
            <Text color="dimmed" size="sm">
              {data.feed.pubDate}
            </Text>
          </Group>
        )}
        {data.feed.lastBuildDate && (
          <Group>
            <IconBulldozer size={14} />
            <Text color="dimmed" size="sm">
              {formatDate(data.feed.lastBuildDate)}
            </Text>
          </Group>
        )}
        {data.feed.feedUrl && (
          <Group spacing="sm">
            <IconSpeakerphone size={14} />
            <Text
              color="dimmed"
              size="sm"
              variant="link"
              target="_blank"
              component={Link}
              href={data.feed.feedUrl}
            >
              Feed URL
            </Text>
          </Group>
        )}
        <ActionIcon
          size="sm"
          radius="xl"
          pos="absolute"
          right={10}
          onClick={() => refetch()}
          bottom={10}
          styles={{
            root: {
              borderColor: 'red',
            },
          }}
        >
          {data.feed.image ? (
            <Image src={data.feed.image.url} alt={data.feed.image.title} mx="auto" />
          ) : (
            <IconRefresh />
          )}
        </ActionIcon>
      </Flex>
    </Stack>
  );
}

const TimeDisplay = ({ date }: { date: string }) => (
  <Group mt="auto" spacing="xs">
    <IconClock size={14} />
    <Text size="xs" color="dimmed">
      {date}
    </Text>
  </Group>
);

const useStyles = createStyles(({ colorScheme }) => ({
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    filter: colorScheme === 'dark' ? 'blur(30px)' : 'blur(15px)',
    transform: 'scaleX(-1)',
    opacity: colorScheme === 'dark' ? 0.3 : 0.2,
    transition: 'ease-in-out 0.2s',

    '&:hover': {
      opacity: colorScheme === 'dark' ? 0.4 : 0.3,
      filter: 'blur(40px) brightness(0.7)',
    },
  },
}));

export default definition;
