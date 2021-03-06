import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',

    '&.show-sleeping': {
      filter: 'grayscale(100%)'
    }
  }
}

@withStyles(styles)
class MailboxServiceIcon extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    iconUrl: PropTypes.string.isRequired,
    showSleeping: PropTypes.bool.isRequired,
    size: PropTypes.number.isRequired
  }

  static defaultProps = {
    size: 40
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      iconUrl,
      showSleeping,
      size,
      style,
      className,
      classes,
      ...passProps
    } = this.props

    return (
      <div
        className={classNames(
          classes.root,
          showSleeping ? 'show-sleeping' : undefined,
          className
        )}
        style={{
          width: size,
          height: size,
          backgroundImage: `url("${iconUrl}")`,
          ...style
        }}
        {...passProps} />
    )
  }
}

export default MailboxServiceIcon
