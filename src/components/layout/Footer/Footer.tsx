import { QuestionCircleOutlined } from '@ant-design/icons';
import MarkdownModal from '@src/components/modals/MarkdownModal';
import { Tooltip } from 'antd';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// --- FIX: Remove import of missing CHANGELOG.md ---
// import changeLog from '../../../../CHANGELOG.md?raw'; // <-- REMOVE THIS LINE

import { ARIO_DISCORD_LINK } from '../../../utils/constants';
import { APP_VERSION } from '../../../utils/constants';
import { BrandLogo } from '../../icons';
import './styles.css';

// --- FIX: Provide fallback changelog text or leave empty ---
const FORMATTED_CHANGELOG = `Changelog not available.`;
// If you want, you can provide your actual changelog as a string above, or load from another source.

function Footer() {
  const [showChangeLogModal, setShowChangeLogModal] = useState(false);

  return (
    <div
      className={'flex-row app-footer'}
      style={{
        borderTop: '1px solid var(--text-faded)',
        boxSizing: 'border-box',
      }}
    >
      <div className={'flex-row flex-left'} style={{ width: 'fit-content' }}>
        <BrandLogo width={'30px'} height={'30px'} fill={'var(--text-grey)'} />
        <Link
          className="grey text hover:text-white"
          to={'https://ar.io/legal/terms-of-service-and-privacy-policy'}
          rel="noreferrer"
          target={'_blank'}
        >
          <span style={{ whiteSpace: 'nowrap' }}>Terms & Conditions</span>
        </Link>
      </div>

      <div
        className="flex-space-between"
        style={{
          width: '100%',
        }}
      ></div>

      <div
        className="flex-row flex-right w-fit"
        style={{ width: 'fit-content' }}
      >
        <Tooltip
          title="Show Changelog"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="flex flex-row flex-right text grey center hover:text-white"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setShowChangeLogModal(true)}
          >
            v{APP_VERSION}-{import.meta.env.VITE_GITHUB_HASH?.slice(0, 6)}
          </button>
        </Tooltip>
        <Tooltip
          title="Github"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="button grey text center hover pointer"
            onClick={() => window.open('https://github.com/ar-io/', '_blank')}
          >
            <FaGithub className="size-4 stroke-grey fill-grey hover:stroke-white hover:fill-white" />
          </button>
        </Tooltip>
        <Tooltip
          title="Discord"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="button grey text center hover pointer"
            onClick={() => window.open(ARIO_DISCORD_LINK, '_blank')}
          >
            <FaDiscord className="size-4 stroke-grey fill-grey hover:stroke-white hover:fill-white" />
          </button>
        </Tooltip>
        <Tooltip
          title="Documentation"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="button grey text center hover pointer hover:text-white"
            onClick={() => window.open('https://docs.ar.io/arns', '_blank')}
          >
            <QuestionCircleOutlined className="text-base" />
          </button>
        </Tooltip>
      </div>
      {showChangeLogModal ? (
        <MarkdownModal
          title="Changelog"
          markdownText={FORMATTED_CHANGELOG}
          onClose={() => setShowChangeLogModal(false)}
        />
      ) : null}
    </div>
  );
}

export default Footer;