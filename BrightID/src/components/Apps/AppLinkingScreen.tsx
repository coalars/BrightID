import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import { BLACK, DARKER_GREY, GREEN, ORANGE, RED, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { useDispatch, useSelector } from '@/store/hooks';
import { fontSize } from '@/theme/fonts';
import {
  resetLinkingAppState,
  selectLinkingAppInfo,
  selectSponsoringStep,
  selectSponsoringStepText,
  setSponsoringStep,
} from '@/reducer/appsSlice';
import { sponsoring_steps } from '@/utils/constants';
import { selectIsSponsored } from '@/reducer/userSlice';

const SponsoringView = ({ sponsoringStep, appName, text }) => {
  const isSponsored = useSelector(selectIsSponsored);

  let iconData: { color: string; name: string };
  let stateDescription: string;
  const stateDetails = text;
  switch (sponsoringStep) {
    case sponsoring_steps.PRECHECK_APP:
      stateDescription = `Checking for prior sponsoring request`;
      break;
    case sponsoring_steps.WAITING_OP:
      stateDescription = `Requesting sponsorship from app`;
      break;
    case sponsoring_steps.WAITING_APP:
      stateDescription = `Waiting for ${appName} to sponsor you`;
      break;
    case sponsoring_steps.ERROR_OP:
      iconData = { color: RED, name: 'alert-circle-outline' };
      stateDescription = `Error submitting request sponsorship operation!`;
      break;
    case sponsoring_steps.ERROR_APP:
      iconData = { color: RED, name: 'alert-circle-outline' };
      stateDescription = `Timeout waiting for ${appName} to sponsor you!`;
      break;
    case sponsoring_steps.SUCCESS:
    case sponsoring_steps.LINK_WAITING_V5:
    case sponsoring_steps.LINK_WAITING_V6:
    case sponsoring_steps.LINK_SUCCESS:
      iconData = { color: GREEN, name: 'checkmark-circle-outline' };
      stateDescription = `Successfully sponsored!`;
      break;
    default:
      if (isSponsored) {
        iconData = { color: GREEN, name: 'checkmark-circle-outline' };
        stateDescription = `You are sponsored.`;
      } else {
        iconData = { color: RED, name: 'alert-circle-outline' };
        stateDescription = `You are not sponsored.`;
      }
  }

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeaderTextContainer}>
        <Text style={styles.stepHeaderText}>Sponsoring phase</Text>
      </View>
      <View style={styles.statusContainer}>
        <View>
          {iconData ? (
            <IonIcons
              style={{ alignSelf: 'center' }}
              size={DEVICE_LARGE ? 64 : 44}
              name={iconData.name}
              color={iconData.color}
            />
          ) : (
            <Spinner
              isVisible={true}
              size={DEVICE_LARGE ? 64 : 44}
              type="Wave"
              color={ORANGE}
            />
          )}
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoText}>{stateDescription}</Text>
          {stateDetails && (
            <Text style={styles.infoSubText}>{stateDetails}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const LinkingView = ({ sponsoringStep, text }) => {
  const { t } = useTranslation();
  let iconData: { color: string; name: string };
  let stateDescription: string;
  const stateDetails = text;

  switch (sponsoringStep) {
    case sponsoring_steps.LINK_WAITING_V5:
      stateDescription = `Waiting for link operation to confirm`;
      break;
    case sponsoring_steps.LINK_WAITING_V6:
      stateDescription = `Waiting for link function to complete`;
      break;
    case sponsoring_steps.LINK_ERROR:
      iconData = { color: RED, name: 'alert-circle-outline' };
      stateDescription = t('apps.alert.title.linkingFailed');
      break;
    case sponsoring_steps.LINK_SUCCESS:
      iconData = { color: GREEN, name: 'checkmark-circle-outline' };
      stateDescription = `Successfully linked!`;
      break;
    default:
      iconData = { color: DARKER_GREY, name: 'information-circle-outline' };
      stateDescription = `Waiting for sponsoring before linking phase can start.`;
  }

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeaderTextContainer}>
        <Text style={styles.stepHeaderText}>Linking phase</Text>
      </View>
      <View style={styles.statusContainer}>
        <View>
          {iconData ? (
            <IonIcons
              style={{ alignSelf: 'center' }}
              size={DEVICE_LARGE ? 64 : 44}
              name={iconData.name}
              color={iconData.color}
            />
          ) : (
            <Spinner
              isVisible={true}
              size={DEVICE_LARGE ? 64 : 44}
              type="Wave"
              color={ORANGE}
            />
          )}
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoText}>{stateDescription}</Text>
          {stateDetails && (
            <Text style={styles.infoSubText}>{stateDetails}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const AppLinkingScreen = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const sponsoringStep = useSelector(selectSponsoringStep);
  const sponsoringStepText = useSelector(selectSponsoringStepText);
  const linkingAppInfo = useSelector(selectLinkingAppInfo);

  const error_states = [
    sponsoring_steps.ERROR_OP,
    sponsoring_steps.ERROR_APP,
    sponsoring_steps.LINK_ERROR,
  ];
  const isError = error_states.includes(sponsoringStep);
  const isSuccess = sponsoringStep === sponsoring_steps.LINK_SUCCESS;

  const showSponsoring = sponsoringStep <= sponsoring_steps.SUCCESS;

  let resultContainer;
  if (isError || isSuccess) {
    resultContainer = (
      <>
        <View style={styles.resultContainer}>
          <View style={styles.resultTextContainer}>
            {isSuccess && (
              <Text style={styles.resultContainerSuccessText}>
                {t('apps.alert.text.linkSuccess', {
                  context: linkingAppInfo.appInfo.name,
                })}
              </Text>
            )}
            {isError && (
              <Text style={styles.resultContainerErrorText}>
                {t('apps.alert.title.linkingFailed')}
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              testID="ResetAppLinkingState"
              style={styles.resetButton}
              onPress={() => {
                dispatch(resetLinkingAppState());
              }}
            >
              <Text style={styles.resetText}>{t('common.alert.dismiss')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={BLACK}
      />
      <TouchableWithoutFeedback onPress={goBack}>
        <View style={styles.blurView} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        {sponsoringStep !== sponsoring_steps.IDLE && (
          <>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>
                Linking with{' '}
                <Text style={styles.headerTextAppname}>
                  {linkingAppInfo.appInfo.name}
                </Text>
              </Text>
            </View>

            {showSponsoring ? (
              <SponsoringView
                sponsoringStep={sponsoringStep}
                text={sponsoringStepText}
                appName={linkingAppInfo.appInfo.name}
              />
            ) : (
              <LinkingView
                sponsoringStep={sponsoringStep}
                text={sponsoringStepText}
              />
            )}
            {resultContainer}
          </>
        )}
        <View style={{ marginBottom: 2 }}>
          <TouchableOpacity
            disabled={sponsoringStep >= sponsoring_steps.LINK_SUCCESS}
            onPress={() =>
              dispatch(setSponsoringStep({ step: sponsoringStep + 1 }))
            }
          >
            <Text>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={sponsoringStep <= sponsoring_steps.IDLE}
            onPress={() =>
              dispatch(setSponsoringStep({ step: sponsoringStep - 1 }))
            }
          >
            <Text>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AppLinkingScreen;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    width: '90%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 30 : 25,
  },
  divider: {
    width: DEVICE_LARGE ? 240 : 200,
    marginTop: 20,
    marginBottom: 25,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BLACK,
  },
  stepContainer: {
    width: '100%',
    marginTop: 0,
  },
  headerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[20],
    color: BLACK,
  },
  headerTextAppname: {
    fontFamily: 'Poppins-Bold',
  },
  stepHeaderTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepHeaderText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[18],
    color: BLACK,
  },
  headerInfoText: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    color: DARKER_GREY,
    fontSize: fontSize[12],
    maxWidth: '90%',
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 20,
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: BLACK,
  },
  infoSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[10],
    color: BLACK,
  },
  resultContainer: {
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  resultTextContainer: {
    padding: 2,
  },
  resultContainerSuccessText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: BLACK,
  },
  resultContainerErrorText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: RED,
  },
  buttonContainer: {
    marginTop: 15,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: ORANGE,
    borderRadius: 60,
    width: DEVICE_LARGE ? 240 : 200,
    marginBottom: 10,
  },
  resetText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: WHITE,
    marginLeft: 10,
  },
});
