class ApplicationController < ActionController::Base
  include HttpAcceptLanguage::AutoLocale
  before_action :set_locale

  def set_locale
    I18n.locale = locale
  end

  def locale
    @locale ||= params[:locale] ||= I18n.default_locale
  end

  def default_url_options(options={})
    options.merge(locale: locale)
  end
end
