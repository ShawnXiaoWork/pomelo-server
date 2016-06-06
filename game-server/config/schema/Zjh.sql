# Dump of table User
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ZjhAccount` (
  `id` smallint(11) unsigned NOT NULL AUTO_INCREMENT,
  `nickname` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `identifier` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `unionid` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL,
  `system` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL,
  `pv` smallint(6) COLLATE utf8_unicode_ci DEFAULT '0',
  `netmode` smallint(6) COLLATE utf8_unicode_ci DEFAULT '0',
  `phone` smallint(11) COLLATE utf8_unicode_ci DEFAULT '0',
  `versionName` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL,
  `versionCode` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL,
  `passwd` varchar(50) COLLATE utf8_unicode_ci DEFAULT '',
  `lastLoginTime` bigint(20) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_ACCOUNT_NAME` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `ZjhUser` (
  `id` smallint(11) unsigned NOT NULL,
  `vipExp` smallint(11) COLLATE utf8_unicode_ci DEFAULT '0',
  `nickname` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
  `sex` smallint(6) COLLATE utf8_unicode_ci DEFAULT '0',
  `signature` varchar(50) COLLATE utf8_unicode_ci DEFAULT '',
  `contect` varchar(50) COLLATE utf8_unicode_ci DEFAULT '',
  `coin` bigint(20) COLLATE utf8_unicode_ci DEFAULT '0',
  `zuan` bigint(20) COLLATE utf8_unicode_ci DEFAULT '0',
  `photo` varchar(50) COLLATE utf8_unicode_ci DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
