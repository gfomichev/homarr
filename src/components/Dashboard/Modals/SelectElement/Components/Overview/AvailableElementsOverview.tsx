import { Group, Space, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconBox, IconStack, IconTextResize } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { openContextModalGeneric } from '../../../../../../tools/mantineModalManagerExtensions';
import { AppType } from '../../../../../../types/app';
import { useStyles } from '../Shared/styles';

interface AvailableElementTypesProps {
  onOpenIntegrations: () => void;
  onOpenStaticElements: () => void;
}

export const AvailableElementTypes = ({
  onOpenIntegrations: onOpenWidgets,
  onOpenStaticElements,
}: AvailableElementTypesProps) => {
  const { t } = useTranslation('layout/element-selector/selector');

  return (
    <>
      <Text color="dimmed">{t('modal.text')}</Text>
      <Space h="lg" />
      <Group spacing="md" grow>
        <ElementItem
          name="Apps"
          icon={<IconBox size={40} strokeWidth={1.3} />}
          onClick={() => {
            openContextModalGeneric<{ app: AppType; allowAppNamePropagation: boolean }>({
              modal: 'editApp',
              innerProps: {
                app: {
                  id: uuidv4(),
                  name: 'Your app',
                  url: 'https://homarr.dev',
                  appearance: {
                    iconUrl: '/imgs/logo/logo.png',
                  },
                  network: {
                    enabledStatusChecker: false,
                    okStatus: [],
                  },
                  behaviour: {
                    isOpeningNewTab: true,
                    onClickUrl: '',
                  },
                  area: {
                    type: 'sidebar',
                    properties: {
                      location: 'right',
                    },
                  },
                  shape: {
                    location: {
                      x: 0,
                      y: 0,
                    },
                    size: {
                      height: 1,
                      width: 1,
                    },
                  },
                  integration: {
                    type: null,
                    properties: [],
                  },
                },
                allowAppNamePropagation: true,
              },
              size: 'xl',
            });
          }}
        />
        <ElementItem
          name="Widgets"
          icon={<IconStack size={40} strokeWidth={1.3} />}
          onClick={onOpenWidgets}
        />
        <ElementItem
          name="Static Element"
          icon={<IconTextResize size={40} strokeWidth={1.3} />}
          onClick={onOpenStaticElements}
        />
      </Group>
    </>
  );
};

interface ElementItemProps {
  icon: ReactNode;
  name: string;
  onClick: () => void;
}

const ElementItem = ({ name, icon, onClick }: ElementItemProps) => {
  const { classes, cx } = useStyles();
  return (
    <UnstyledButton
      className={cx(classes.elementButton, classes.styledButton)}
      onClick={onClick}
      py="md"
    >
      <Stack className={classes.elementStack} align="center" spacing={5}>
        {icon}
        <Text className={classes.elementName} weight={500} size="sm">
          {name}
        </Text>
      </Stack>
    </UnstyledButton>
  );
};
